const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const REVIEW_ONLY_AUTH_PATHS = new Set([
  "/auth/login",
  "/auth/logout",
  "/auth/mfa/verify",
]);

export const enforceProductionFreeze = (req, res, next) => {
  const frozen = process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_WRITES !== "true";
  const isReadOnlyAuthAction = req.baseUrl === "/api" && REVIEW_ONLY_AUTH_PATHS.has(req.path);

  if (frozen && MUTATING_METHODS.has(req.method) && !isReadOnlyAuthAction) {
    res.set("Retry-After", "86400");
    return res.status(503).json({
      success: false,
      code: "PRODUCTION_REVIEW_ONLY",
      error: "This deployment is review-only while privacy and clinical-safety approval is pending.",
    });
  }

  next();
};
