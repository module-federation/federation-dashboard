import { NativeFederationBuildExecutorOptions } from "./schema";
//import { ExecutorContext } from '@nrwl/devkit';

import executor from "./executor";

const options: NativeFederationBuildExecutorOptions = {
  baseUrl: "http://localhost:3000/",
};

describe("Build Executor", () => {
  it("can run", async () => {
    const output = await executor(options, null);
    expect(output.success).toBe(true);
  });
});

/*fterAll((done) => {
  done();
});*/
