import { openDB } from "idb";
import Worker from "web-worker";

const DB_NAME = "hysdk";
const STORE_NAME = "state";

async function initDB() {
  return await openDB(DB_NAME, 3, {
    upgrade(db, _oldVersion, _newVersion, _transaction) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

let cachedWorkerContents: string | undefined = undefined;

async function initWorker(): Promise<Worker> {
  if (!cachedWorkerContents) {
    let workerRes = await fetch("https://dl.kartikn.com/file/worker.mjs");
    cachedWorkerContents = await workerRes.text();
  }

  let worker = new Worker(
    `data:application/javascript,${encodeURIComponent(cachedWorkerContents)}`,
    {
      type: "module",
    }
  );

  await new Promise((res) => {
    worker.addEventListener("message", (e) => {
      if (e.data.operation === "initialized") res(worker);
    });
  });

  worker.addEventListener("message", async function (e) {
    const { responseBuffer, operation, args } = e.data;
    const i32 = new Int32Array(responseBuffer);

    switch (operation) {
      case "state_get": {
        const db = await initDB();
        const value = await db.get(STORE_NAME, args[0]);
        if (value !== undefined && !(value instanceof Uint8Array)) {
          throw "expect values in IndexedDB to be Uint8Array";
        }

        i32[0] = value.byteLength;
        const buffer = new Uint8Array(i32.buffer);
        value.forEach((byte: number, i: number) => {
          buffer[i + 4] = byte;
        });

        break;
      }
      case "state_set": {
        const db = await initDB();
        await db.put(STORE_NAME, args[1], args[0]);
        break;
      }
      case "log": {
        console.log(args[0]);
        return;
      }
      case "result":
        // console.log("result: ", args);
        return;
    }

    Atomics.notify(i32, 0);
  });

  return worker;
}

export type Proof = {
  bytes: Uint8Array;
  inputs: Uint8Array;
};

export type Options = {
  includeInternalTimes: boolean;
};

export class Module {
  __internal_module_object: any;
  binary: Uint8Array;
  worker?: Worker;

  /**
   * Creates a new uninitialized `Module` object.
   */
  constructor(binary: Uint8Array) {
    this.__internal_module_object = null;

    if (binary instanceof ArrayBuffer) {
      this.binary = new Uint8Array(binary);
    } else if (!(binary instanceof Uint8Array)) {
      throw "Binary must be `Uint8Array` or `ArrayBuffer`";
    } else {
      this.binary = binary;
    }
  }

  /**
   * Initializes the module (preparing it for export invocations).
   */
  async init(): Promise<void> {
    if (this.initialized()) {
      throw "Module double initialization.";
    }

    this.worker = await initWorker();
    this.worker.postMessage({ action: "init_module", args: [this.binary] });

    return new Promise((res) => {
      this.worker!.addEventListener("message", (e) => {
        if (e.data.operation === "result" && e.data.action === "init_module") {
          this.__internal_module_object = e.data.result;
          res();
        }
      });
    });
  }

  /**
   * Returns if this `Module` object has been intialized or not.
   */
  initialized(): boolean {
    return this.__internal_module_object !== null;
  }

  /**
   * Creates a new `Module` from a provided Wasm binary.
   */
  static async fromBinary(binary: Uint8Array): Promise<Module> {
    let result = new Module(binary);
    await result.init();
    return result;
  }

  /**
   * Invokes an export on the module and returns the result.
   */
  async invokeExport(
    exportName: string,
    args: Uint8Array[],
    opts?: Options
  ): Promise<{
    proof: Proof;
    result: Uint8Array;
    times?: { proving: BigInt; execution: BigInt };
  }> {
    if (!this.initialized()) {
      throw "Attempt to use uninitialized module.";
    }

    args.forEach((arg: any, i) => {
      if (!(arg instanceof Uint8Array)) {
        if (arg instanceof ArrayBuffer) {
          args[i] = new Uint8Array(arg);
        } else {
          throw "Arguments must be `Uint8Array` or `ArrayBuffer`";
        }
      }
    });

    this.worker!.postMessage({
      action: "invoke_export",
      args: [this.__internal_module_object, exportName, args],
    });

    return new Promise((res) => {
      this.worker!.addEventListener("message", (e) => {
        if (
          e.data.operation === "result" &&
          e.data.action === "invoke_export"
        ) {
          if (opts && opts.includeInternalTimes) {
            res({
              proof: e.data.result.proof,
              result: e.data.result.result,
              times: {
                proving: e.data.result.proving_time,
                execution: e.data.result.execution_time,
              },
            });
          } else {
            res({ proof: e.data.result.proof, result: e.data.result.result });
          }
        }
      });
    });
  }

  /**
   * Terminates the background `Worker` that the Wasm is running in. You usually
   * shouldn't have to do this manually but it can become relevant if you're running
   * server-side or if you need to save resources while exeucting multiple modules
   * on the same page.
   */
  destroy() {
    this.worker?.terminate();
  }
}

export class JSModule {
  _module?: Module;
  source: string;

  /**
   * Creates a new uninitialized `JSModule` object.
   */
  constructor(source: string) {
    this._module = undefined;
    this.source = source;
  }

  /**
   * Initializes the module (preparing it for function invocations).
   */
  async init(): Promise<void> {
    if (this.initialized()) {
      throw "JSModule double initialization";
    }

    let exec_js_binary = [
      0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 127, 127, 127, 1, 127, 2, 29,
      2, 3, 101, 110, 118, 6, 109, 101, 109, 111, 114, 121, 2, 0, 1, 3, 101,
      110, 118, 7, 101, 120, 101, 99, 95, 106, 115, 0, 0, 3, 2, 1, 0, 7, 11, 1,
      7, 101, 120, 101, 99, 95, 106, 115, 0, 1, 10, 13, 1, 11, 0, 32, 0, 32, 1,
      32, 2, 16, 0, 15, 11, 0, 34, 4, 110, 97, 109, 101, 1, 27, 2, 0, 7, 101,
      120, 101, 99, 95, 106, 115, 1, 15, 101, 120, 101, 99, 95, 106, 115, 95,
      119, 114, 97, 112, 112, 101, 114,
    ];
    this._module = await Module.fromBinary(new Uint8Array(exec_js_binary));
  }

  /**
   * Creates and initializes a `JSModule` instance.
   */
  static async fromSource(source: string): Promise<JSModule> {
    let mod = new JSModule(source);
    await mod.init();
    return mod;
  }

  /**
   * Creates and initializes a `JSModule` instance from a path.
   */
  static async fromPath(path: string): Promise<JSModule> {
    let res = await fetch(path);
    let source = await res.text();
    let mod = new JSModule(source);
    await mod.init();
    return mod;
  }

  /**
   * Returns if this `JSModule` object has been intialized or not.
   */
  initialized(): boolean {
    return this._module !== undefined;
  }

  /**
   * Call a function within the JS module with your provided arguments.
   */
  async call(
    functionName: string,
    args: any[],
    opts?: Options
  ): Promise<{
    proof: Proof;
    result: any;
    times?: { proving: BigInt; execution: BigInt };
  }> {
    if (!this.initialized()) {
      throw "Attempt to use uninitialized JS module.";
    }

    let argArrays = args.map((value) =>
      new TextEncoder().encode(JSON.stringify(value))
    );

    let allArgsLen = argArrays
      .map((arr) => arr.byteLength)
      .reduce((acc, a) => acc + a, 0);
    let mergedArgs = new Uint8Array(allArgsLen + argArrays.length * 4);
    let dataView = new DataView(mergedArgs.buffer);

    let i = 0;
    argArrays.forEach((arr) => {
      dataView.setUint32(i, arr.byteLength, true);
      i += 4;
      for (let j = 0; j < arr.byteLength; j++) {
        mergedArgs[i + j] = arr[j];
      }
      i += arr.byteLength;
    });

    let invocationResult = await this._module!.invokeExport(
      "exec_js",
      [
        new TextEncoder().encode(this.source),
        new TextEncoder().encode(functionName),
        mergedArgs,
      ],
      opts
    );

    let result: {
      proof: Proof;
      result: any;
      times?: { proving: BigInt; execution: BigInt };
    } = {
      proof: invocationResult.proof,
      result: JSON.parse(new TextDecoder().decode(invocationResult.result)),
    };

    if (opts && opts.includeInternalTimes) {
      result.times = invocationResult.times;
    }

    return result;
  }

  /**
   * See `Module.destroy`.
   */
  destroy() {
    this._module?.destroy();
  }
}

/**
 * Verifies a proof, returns whether it's valid or not.
 */
export async function verify(
  proof: Proof,
  opts?: Options
): Promise<boolean | { result: boolean; timeTaken: BigInt }> {
  let worker = await initWorker();
  worker.postMessage({ action: "verify", args: [proof] });

  return new Promise((res) => {
    worker.addEventListener("message", (e) => {
      if (e.data.operation === "result" && e.data.action === "verify") {
        worker.terminate();
        if (opts && opts.includeInternalTimes) {
          res({
            result: e.data.result.result,
            timeTaken: e.data.result.time_taken,
          });
        } else {
          res(e.data.result.result);
        }
      }
    });
  });
}
