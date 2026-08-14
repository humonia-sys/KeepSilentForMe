import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(repositoryRoot, "dist", "tauri");

function inside(base, relativePath) {
  const baseRoot = resolve(base);
  const target = resolve(baseRoot, relativePath);
  const prefix = `${baseRoot}${sep}`;
  if (target !== baseRoot && !target.startsWith(prefix)) {
    throw new Error(`Refusing to copy outside ${baseRoot}: ${relativePath}`);
  }
  return target;
}

function copyManifestAssets(sourceRoot, destinationRoot) {
  const manifestPath = resolve(sourceRoot, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  mkdirSync(destinationRoot, { recursive: true });
  cpSync(manifestPath, resolve(destinationRoot, "manifest.json"));

  for (const asset of manifest.assets ?? []) {
    if (!asset || typeof asset.path !== "string") {
      throw new Error(`Invalid asset entry in ${manifestPath}`);
    }
    const sourcePath = inside(sourceRoot, asset.path);
    const destinationPath = inside(destinationRoot, asset.path);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing runtime asset: ${relative(repositoryRoot, sourcePath)}`);
    }
    mkdirSync(dirname(destinationPath), { recursive: true });
    cpSync(sourcePath, destinationPath);
  }
}

function copyManifestBackgrounds(sourceRoot, destinationRoot) {
  const manifest = JSON.parse(readFileSync(resolve(sourceRoot, "manifest.json"), "utf8"));
  for (const [id, relativePath] of Object.entries(manifest.backgrounds ?? {})) {
    if (typeof relativePath !== "string" || !relativePath) {
      throw new Error(`Invalid background entry ${id} in ${sourceRoot}/manifest.json`);
    }
    const sourcePath = resolve(sourceRoot, relativePath);
    const destinationPath = resolve(destinationRoot, relativePath);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing runtime background: ${relative(repositoryRoot, sourcePath)}`);
    }
    mkdirSync(dirname(destinationPath), { recursive: true });
    cpSync(sourcePath, destinationPath);
  }
}

function runtimeFiles() {
  const files = [resolve(distRoot, "index.html")];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
      } else if (entry.isFile() && filePath.endsWith(".js")) {
        files.push(filePath);
      }
    }
  };
  walk(resolve(distRoot, "js"));
  return files;
}

rmSync(distRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });
cpSync(resolve(repositoryRoot, "web"), distRoot, { recursive: true });

for (const filePath of runtimeFiles()) {
  const rewritten = readFileSync(filePath, "utf8")
    .replaceAll("../art/", "art/")
    .replaceAll("../script/", "script/");
  writeFileSync(filePath, rewritten);
}

copyManifestAssets(
  resolve(repositoryRoot, "art", "v4", "playable"),
  resolve(distRoot, "art", "v4", "playable"),
);
copyManifestBackgrounds(
  resolve(repositoryRoot, "art", "v4", "playable"),
  resolve(distRoot, "art", "v4", "playable"),
);
copyManifestAssets(
  resolve(repositoryRoot, "art", "v4", "scenes"),
  resolve(distRoot, "art", "v4", "scenes"),
);

const scriptSource = resolve(repositoryRoot, "script");
const scriptDestination = resolve(distRoot, "script");
cpSync(scriptSource, scriptDestination, {
  recursive: true,
  filter: (sourcePath) => !sourcePath.endsWith(".md"),
});
for (const required of [
  resolve(scriptDestination, "chapters.json"),
  resolve(scriptDestination, "locales", "manifest.json"),
]) {
  if (!existsSync(required)) throw new Error(`Missing Tauri runtime data: ${relative(repositoryRoot, required)}`);
}

for (const filePath of runtimeFiles()) {
  const rewrittenFile = readFileSync(filePath, "utf8");
  for (const stalePath of ["../art/", "../script/"]) {
    if (rewrittenFile.includes(stalePath)) {
      throw new Error(`Unrewritten runtime path in dist/tauri/${relative(distRoot, filePath)}: ${stalePath}`);
    }
  }
}

console.log(`Prepared Tauri frontend at ${relative(repositoryRoot, distRoot)}`);
