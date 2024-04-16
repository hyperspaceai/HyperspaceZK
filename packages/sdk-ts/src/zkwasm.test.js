const { JSModule, verify } = require("../dist/zkwasm.js");

test("runs basic JSModule correctly", async () => {
  const mod = await JSModule.fromSource(`
    function add(a, b) {
        return a + b;
    }
  `);
  const { result, proof } = await mod.call("add", [1, 2]);
  mod.destroy();
  expect(result).toBe(3);
  expect(await verify(proof)).toBe(true);
}, 15_000);
