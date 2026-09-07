import node from "eslint-plugin-n"
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    plugins: { n: node },
    extends: ["n/recommended-module"],
  }
])
