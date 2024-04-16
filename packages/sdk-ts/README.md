# zkWasm SDK

While networking is being worked on, this currently only holds the JavaScript SDK for zkWasm. You can use this library client or server-side as long as the runtime supports `Wasm`, Workers, and IndexedDB.

# Example

```js
import { Module, verify } from 'zkwasm';

let wasmBinary = { ... }; // This can be acquired in any way
let module = await Module.fromBinary(wasmBinary);
let { result, proof } = module.invokeExport('test', [...serializedArguments]);

console.log(result);
console.log(verify(proof)); // Check if a proof is valid
```

# Documentation

Check the [documentation site](https://nanozk.com/docs/zkwasm) for up to date information.
