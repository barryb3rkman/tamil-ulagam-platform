import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const repoRoot = import.meta.dirname;

// ESLint config lives per workspace package, not at the root, so a
// staged file has to be linted from the directory that owns it.
function packageRootFor(file) {
  let dir = dirname(file);
  while (dir.startsWith(repoRoot) && dir !== repoRoot) {
    if (existsSync(resolve(dir, "eslint.config.mjs"))) return dir;
    dir = dirname(dir);
  }
  return null;
}

export default {
  "*.{ts,tsx,mjs,js}": (files) => {
    const commands = [`prettier --write ${files.map(quote).join(" ")}`];
    const byPackage = new Map();

    for (const file of files) {
      const root = packageRootFor(file);
      if (!root) continue;
      byPackage.set(root, [...(byPackage.get(root) ?? []), file]);
    }

    for (const [root, owned] of byPackage) {
      const paths = owned.map((f) => quote(relative(root, f))).join(" ");
      commands.push(
        `pnpm --dir ${quote(root)} exec eslint --fix --max-warnings=0 ${paths}`,
      );
    }

    return commands;
  },
  "*.{json,css,md,yml,yaml}": (files) => [
    `prettier --write ${files.map(quote).join(" ")}`,
  ],
};

function quote(value) {
  return `"${value}"`;
}
