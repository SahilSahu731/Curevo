import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(root, "src");
const output = path.resolve(root, "../docs/audits/m5-interactive-controls.json");
const tags = ["form", "Link", "a", "Button", "button", "Input", "Textarea", "Select", "DropdownMenuItem", "Dialog", "AlertDialog", "Card"];
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const records = [];

for (const file of walk(sourceRoot).filter((item) => item.endsWith(".tsx"))) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    for (const tag of tags) {
      if (!new RegExp(`<${tag}(?:\\s|>)`).test(lines[index])) continue;
      const snippet = lines.slice(index, Math.min(index + 8, lines.length)).join(" ").split(">")[0];
      let classification = "implemented";
      if (/href\s*=\s*["']#["']/.test(snippet)) classification = "broken";
      else if (/disabled(?:\s|=|$)/.test(snippet) && !/disabled\s*=\s*\{/.test(snippet)) classification = "intentionally-disabled";
      else if (tag === "Card" && !/(onClick|href|asChild)/.test(snippet)) classification = "intentionally-informational";
      else if (tag === "form" && !/onSubmit/.test(snippet)) classification = "partially-implemented";
      records.push({ file: path.relative(root, file), line: index + 1, control: tag, classification });
    }
  }
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: records.length, records }, null, 2)}\n`);
const unresolved = records.filter((record) => ["broken", "placeholder"].includes(record.classification));
console.log(`Inventoried ${records.length} controls; ${unresolved.length} unresolved.`);
if (unresolved.length) process.exit(1);
