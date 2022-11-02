import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import { ExecutorContext } from "@nrwl/devkit";
import { NativeFederationBuildExecutorOptions } from "./schema";

/**
 *
 */
const NATIVE_FEDERATION_BUILDER_NAME = (name: string): string => {
  return `nfp-${name}-builder`;
};

/**
 *
 */
function createProjectBuilderTsFile(
  workspaceRootPath: string,
  workspaceDistPath: string,
  projectName: string
) {
  const builderOutputFile = path.join(
    workspaceDistPath,
    `./${NATIVE_FEDERATION_BUILDER_NAME(projectName)}.ts`
  );
  const builderTypescript = `
    import { executeBuild } from './build';
    executeBuild('${workspaceRootPath}', '${projectName}');
  `;

  fs.mkdirSync(workspaceDistPath, { recursive: true });
  fs.writeFileSync(builderOutputFile, builderTypescript, {
    encoding: "utf8",
    flag: "w",
  });
}

/**
 *
 */
function removeProjectBuilderTsFile(
  workspaceDistPath: string,
  projectName: string
) {
  const builderOutputFile = path.join(
    workspaceDistPath,
    `./${NATIVE_FEDERATION_BUILDER_NAME(projectName)}.ts`
  );

  try {
    fs.unlinkSync(builderOutputFile);
  } catch (e) {
    throw e;
  }
}

/**
 *
 */
async function compileCommonBuilderTsFile(
  workspaceDistPath: string
): Promise<{ stdout: string; stderr: string }> {
  const builderSourceFile = path.join(__dirname, "./build.ts");
  const bundleCommand = `
    npx tsc --skipLibCheck ${builderSourceFile} --outDir ${workspaceDistPath}
  `;

  return promisify(exec)(bundleCommand);
}

/**
 *
 */
async function compileAndRunProjectBuilderFiles(
  workspaceDistPath: string,
  projectName: string
): Promise<{ stdout: string; stderr: string }> {
  const builderOutputFile = path.join(
    workspaceDistPath,
    `./${NATIVE_FEDERATION_BUILDER_NAME(projectName)}.ts`
  );
  const builderOutputJsFile = path.join(
    workspaceDistPath,
    `./${NATIVE_FEDERATION_BUILDER_NAME(projectName)}.js`
  );
  const bundleAndRunCommand = `
    npx tsc --skipLibCheck ${builderOutputFile} --outDir ${workspaceDistPath} && node ${builderOutputJsFile}
  `;

  return promisify(exec)(bundleAndRunCommand);
}

/**
 *
 */
function onRunExecutorError(error) {
  console.error(error.stderr);
  return { success: false };
}

/**
 * Main function
 */
export default async function runExecutor(
  options: NativeFederationBuildExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const { root: workspaceRootPath, projectName } = context;
  const workspaceDistPath = path.join(workspaceRootPath, `./dist`);

  try {
    await compileCommonBuilderTsFile(workspaceDistPath);
  } catch (e) {
    return onRunExecutorError(e);
  }

  createProjectBuilderTsFile(workspaceRootPath, workspaceDistPath, projectName);

  try {
    await compileAndRunProjectBuilderFiles(workspaceDistPath, projectName);
    removeProjectBuilderTsFile(workspaceDistPath, projectName);
  } catch (e) {
    return onRunExecutorError(e);
  }

  return { success: true };
}
