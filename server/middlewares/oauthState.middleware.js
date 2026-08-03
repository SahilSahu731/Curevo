import { cookieOptions } from "../utils/session.js";
import { hashToken, randomToken, safeEqual } from "../utils/security.js";

const OAUTH_COOKIE = "curevo_oauth_state";

export const safeRelativeRedirect = (value) => {
  if (!value || typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "";
  try {
    const parsed = new URL(value, "https://curevo.invalid");
    return parsed.origin === "https://curevo.invalid" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : "";
  } catch {
    return "";
  }
};

const makeState = ({ redirect, linkUserId }) => {
  const payload = Buffer.from(JSON.stringify({
    nonce: randomToken(16),
    redirect: safeRelativeRedirect(redirect),
    linkUserId,
    expiresAt: Date.now() + 10 * 60 * 1000,
  })).toString("base64url");
  return `${payload}.${hashToken(`oauth:${payload}`)}`;
};

export const beginOAuth = (req, res, next) => {
  req.oauthState = makeState({ redirect: req.query.redirect, linkUserId: req.user?._id?.toString() });
  res.cookie(OAUTH_COOKIE, req.oauthState, cookieOptions(10 * 60 * 1000));
  next();
};

export const validateOAuthState = (req, res, next) => {
  const state = String(req.query.state || "");
  const cookieState = String(req.cookies[OAUTH_COOKIE] || "");
  const [payload, signature] = state.split(".");
  const { maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie(OAUTH_COOKIE, clearOptions);
  if (!state || !cookieState || !safeEqual(state, cookieState) || !payload || !signature
    || !safeEqual(signature, hashToken(`oauth:${payload}`))) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_state_failed`);
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.expiresAt < Date.now()) throw new Error("expired");
    req.oauthReturn = safeRelativeRedirect(decoded.redirect);
    req.oauthLinkUserId = decoded.linkUserId;
    next();
  } catch {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_state_failed`);
  }
};
