import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/zkwasm.ts",
    output: [
      {
        file: "dist/zkwasm.js",
        format: "cjs",
      },
    ],
    plugins: [typescript(), commonjs()],
  },
  {
    input: "src/zkwasm.ts",
    output: [
      {
        file: "dist/zkwasm.module.js",
        format: "es",
      },
    ],
    plugins: [typescript(), commonjs(), nodeResolve({ browser: true })],
  },
];
