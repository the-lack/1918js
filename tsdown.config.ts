import { cpSync } from "fs";
import { defineConfig } from "tsdown";

const filesToPublish = ["README.md", "package.json", "LICENSE"]

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  onSuccess: async () => {
    filesToPublish.map(fileName => cpSync(fileName, `dist/${fileName}`))
  }
});
