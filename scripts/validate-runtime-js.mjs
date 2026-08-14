import { readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = resolve(repositoryRoot, "web");
const jsRoot = resolve(webRoot, "js");
const indexPath = resolve(webRoot, "index.html");

function collectJavaScriptFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectJavaScriptFiles(path));
    else if (entry.isFile() && path.endsWith(".js")) files.push(path);
  }
  return files.sort();
}

const files = collectJavaScriptFiles(jsRoot);
if (!files.length) throw new Error("web/js 中没有运行时 JavaScript 文件");

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || "语法检查失败").trim();
    throw new Error(`${relative(repositoryRoot, file)}: ${output}`);
  }
}

const index = readFileSync(indexPath, "utf8");
const referenced = [...index.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)(?:\?[^"']*)?"[^>]*>/g)]
  .map((match) => match[1])
  .filter((src) => src.startsWith("js/"));
const expected = files.map((file) => relative(webRoot, file).replaceAll("\\", "/"));
const missing = expected.filter((src) => !referenced.includes(src));
const unexpected = referenced.filter((src) => !expected.includes(src));
if (missing.length || unexpected.length) {
  throw new Error(`index.html 脚本引用不完整：缺失 ${missing.join(", ") || "无"}；多余 ${unexpected.join(", ") || "无"}`);
}
const expectedOrder = [
  ...expected.filter((src) => src !== "js/main.js").sort(),
  "js/main.js",
];
if (JSON.stringify(referenced) !== JSON.stringify(expectedOrder)) {
  throw new Error(`index.html 脚本顺序必须为：${expectedOrder.join(" -> ")}`);
}

console.log(`Runtime JavaScript OK: ${files.length} files, main.js last`);
