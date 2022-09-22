import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";
import { federationBuilder } from "@softarc/native-federation/build";
import { esBuildAdapter } from "@softarc/native-federation-esbuild";
import { NFPWorkspacePaths } from "./interface";

/**
 *
 */
function getWorkspacePaths(
  workspaceRootPath: string,
  projectName: string
): NFPWorkspacePaths {
  const projectPath = path.join(workspaceRootPath, `./apps/${projectName}`);
  const projectSrcPath = path.join(projectPath, `./src`);

  return {
    workspaceRootPath,
    workspaceDistPath: `dist/${projectName}`,
    workspaceTsConfigPath: `tsconfig.json`,
    projectPath,
    projectSrcPath,
    projectEntryPath: path.join(projectSrcPath, "./app/index.ts"),
    projectFederationConfigPath: `apps/${projectName}/federation.config.js`,
  };
}

/**
 *
 */
async function setupNativeFederationBuilder(workspace: NFPWorkspacePaths) {
  await federationBuilder.init({
    options: {
      workspaceRoot: workspace.workspaceRootPath,
      outputPath: workspace.workspaceDistPath,
      tsConfig: workspace.workspaceTsConfigPath,
      federationConfig: workspace.projectFederationConfigPath,
      verbose: false,
    },
    adapter: esBuildAdapter,
  });
}

/**
 *
 */
async function compileProjectEntryFileByEsbuild(workspace: NFPWorkspacePaths) {
  const { workspaceDistPath, workspaceTsConfigPath, projectEntryPath } =
    workspace;

  fs.rmSync(workspaceDistPath, { force: true, recursive: true });

  await esbuild.build({
    entryPoints: [projectEntryPath],
    external: federationBuilder.externals,
    outdir: workspaceDistPath,
    bundle: true,
    platform: "browser",
    format: "esm",
    mainFields: ["es2020", "browser", "module", "main"],
    conditions: ["es2020", "es2015", "module"],
    resolveExtensions: [".ts", ".tsx", ".mjs", ".js"],
    tsconfig: workspaceTsConfigPath,
    splitting: true,
    // plugins: [ commonjs() ]
  });
}

/**
 *
 */
function copyProjectIndexHtml(workspace: NFPWorkspacePaths) {
  const { workspaceDistPath, projectSrcPath } = workspace;
  const indexHtmlFromPath = path.join(projectSrcPath, "./index.html");
  const indexHtmlToPath = path.join(workspaceDistPath, "./index.html");

  const faviconIcoFromPath = path.join(projectSrcPath, "./favicon.ico");
  const faviconIcoToPath = path.join(workspaceDistPath, "./favicon.ico");

  fs.copyFileSync(indexHtmlFromPath, indexHtmlToPath);
  fs.copyFileSync(faviconIcoFromPath, faviconIcoToPath);
}

/**
 * Main function
 */
export async function executeBuild(
  workspaceRootPath: string,
  projectName: string
) {
  const workspace: NFPWorkspacePaths = getWorkspacePaths(
    workspaceRootPath,
    projectName
  );

  await setupNativeFederationBuilder(workspace);

  await compileProjectEntryFileByEsbuild(workspace);

  copyProjectIndexHtml(workspace);

  await federationBuilder.build();
}
