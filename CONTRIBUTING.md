# Thanks you for your contribution!

## commits

- must be followed by conventional commits

## version release

The project is using changesets to manage the versioning, so you need to create a changeset file before creating a PR, you can do that by running the following command:

```bash
yarn changeset
yarn changeset version
```

After providing the necessary information, a changeset file will be created in the `.changeset` folder, you need to commit this file with your changes.

## PR

After creating a PR, the CI will run the tests and linting, if everything is ok, the PR will be merged to the `main` branch.

## release

After merging the PR to the `main` branch, the CI will run the tests and linting, if everything is ok, the CI will create a new release and publish it to the npm registry.
