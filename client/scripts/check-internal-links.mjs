import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appRoot = path.join(root, "src/app");
const sourceRoot = path.join(root, "src");

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const routeForPage = (file) => {
  const relative = path.relative(appRoot, path.dirname(file));
  const segments = relative.split(path.sep).filter((part) => part && !part.startsWith("("));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
};

const routePatterns = walk(appRoot).filter((file) => file.endsWith("page.tsx")).map(routeForPage).map((route) => ({
  route,
  pattern: new RegExp(`^${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[[^/]+\\\]/g, "[^/]+")}/?$`),
}));
const sourceFiles = walk(sourceRoot).filter((file) => /\.(tsx?|css)$/.test(file));
const links = [];
const assets = [];

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  for (const match of text.matchAll(/(?:href\s*=\s*|(?:push|replace)\(\s*)["'`]([^"'`${}]+)["'`]/g)) {
    if (match[1].startsWith("/")) links.push({ file: relative, target: match[1].split(/[?#]/)[0] || "/" });
    if (match[1] === "#") links.push({ file: relative, target: "#" });
  }
  for (const match of text.matchAll(/(?:url\(|src\s*=\s*)["'](\/[A-Za-z0-9._/-]+)["']?\)?/g)) {
    if (!match[1].startsWith("/_next")) assets.push({ file: relative, target: match[1] });
  }
}

const missingLinks = links.filter(({ target }) => target === "#" || !routePatterns.some(({ pattern }) => pattern.test(target)));
const missingAssets = assets.filter(({ target }) => !fs.existsSync(path.join(root, "public", target.slice(1))));
if (missingLinks.length || missingAssets.length) {
  for (const item of missingLinks) console.error(`Missing route ${item.target} referenced by ${item.file}`);
  for (const item of missingAssets) console.error(`Missing asset ${item.target} referenced by ${item.file}`);
  process.exit(1);
}
console.log(`Checked ${new Set(links.map((item) => item.target)).size} internal destinations and ${new Set(assets.map((item) => item.target)).size} first-party assets.`);
