# @module-federation/dashboard-plugin

## 2.7.5

### Patch Changes

- bcb44ca: Huge overview of latest changes, this change also introduces a contribution guide to help contributors understand the process of creating new changesets and PRs.

  ### Commits on Sep 13, 2023:

  Added a new feature to enable cache buster.
  Updated a client version file.
  Made some code style fixes and removed comments.

  ### Commits on Sep 6, 2023:

  Fixed changeset.
  Merged changes from the remote master branch.

  ### Commits on Sep 1, 2023:

  Added a feature related to timeout and fallback for the client version.

  ### Commits on Jun 29, 2023:

  Made a version update.
  Made changes related to Medusa delegate.

  ### Commits on Jan 18, 2023:

  Added Medusa delegate modules.

  ### Commits on Nov 2, 2022:

  Made various fixes and updates.
  Fixed issues related to CI and webpack.
  Removed old package names and changeset files.

  ### Commits on Sep 22, 2022:

  Created new apps and plugins for testing.

  ### Commits on Aug 10, 2022:

  Made version updates and fixed webpack errors.

  ### Commits on Aug 9, 2022:

  Made various updates and fixes.
  Updated Node.js and dependencies.

  ### Commits on Jul 13, 2022:

  Made changes related to version strategy.

  ### Commits on Jul 11, 2022:

  Added support for Next.js.
  Updated dependencies like serve and node-fetch.
  Fixed temporary issues.

  ### Commits on Jul 8, 2022:

  Updated injector to load the remote in a simpler format.
  Removed GraphQL from an API endpoint.
  Fixed token issues.

  ### Commits on Jul 6, 2022:

  Added Git SHA to objects.
  Enabled stats file output.
  Made various updates and fixes.

  ### Commits on Jul 1, 2022:

  Updated endpoints.

  ### Commits on Jun 27, 2022:

  Made version updates.
  Updated injector and API to serve a simpler format for loading the remote.

  ### Commits on May 6, 2022:

  Fixed configurations to help setup work.

  ### Commits on Apr 22, 2022:

  Fixed database store.

  ### Commits on Mar 17, 2022:

  Updated dependencies and fixed build issues.
  Added timers for debugging.

  ### Commits on Jan 11, 2022:

  Updated less dependency.

  ### Commits on Oct 29, 2021:

  Updated Yarn and webpack dependencies.

  ### Commits on Sep 24, 2021:

  Fixed issues related to plugin tokens.

  ### Commits on Sep 21, 2021:

  Added more timers for debugging.
  Made changes to cache settings.

  ### Commits on Sep 20, 2021:

  Made various changes to cache settings, prefetch, and public cache.

  ### Commits on Sep 19, 2021:

  Made changes to buttons, cache headers, and JSON bindings.
  Added new remote versions and endpoints.
  This summary provides an overview of the changes made in the repository, including new features, bug fixes, dependency updates, and other improvements.

## 2.2.0

### Minor Changes

- c8c7f75: Updating pointers to file locations

### Patch Changes

- 5a8ea18: Fixed missing middlewares to RMM
- 2471df5: Add default publishVersion for the remotes to work without param provided by Plugin config

## 2.1.0

### Minor Changes

- a8f94ae: Write mode and Active module management
- b96e5ee: Adding server middleware and fixing partial graph uploads causing dashboard to crash
- 6806ecf: Adding debugger flag for extra logging
- a8f94ae: Plugin writes versioned remotes on its own. Fixed dashboard db delays on versioned modules reflecting in BE

### Patch Changes

- bf3d23e: Fix: build issues with webpack 5.12
- bf3d23e: Fixing raw source output of files
- a9de475: Cleanup dashboard plugin add small optimization on recursive calls
- 6806ecf: Token based auth

## 1.1.0

### Minor Changes

- a32d527: Documentation Formatting and fixing a bug in the pluign that happens when no remoteEntry is emitted at all

## 1.0.1

### Patch Changes

- 50aa8b1: Removing the metadata requirement

## 1.0.0

### Minor Changes

- eb2e7c1: Updating Readmes
- eb2e7c1: Adderssing general upgrades and bugs
- eb2e7c1: Fixing CI issues

### Patch Changes

- eb2e7c1: Fixing bugs in getAllReferenceChunks

## 0.2.0

### Minor Changes

- cbfc105: Upgrade to Webpack 5 Beta 17 API

## 0.1.1

### Patch Changes

- 4c5c34e: Allows for publishing to npm
