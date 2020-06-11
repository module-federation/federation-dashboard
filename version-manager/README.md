# Simple Mock Version Manager

The Federated Module Dashboard connects to a version manager server to get and set the latest versions of the applications in production.

This simple mock server implements the contract so that you can use it as a starting point for whatever implementation you decide to write.

## Installation

```shell script
> yarn
```

## Running the server

```shell script
> yarn start
```

## Extending the data

Simply edit the `versions.json` file at any time, even when the server is latestly running, to add applications, versions, or change the latest version.

## Implementation details

This mock server also implements a GET endpoint on `/` that will return all the latest version information. This functionality is provided for demonstration purposed only and is _not_ required by the Federated Modules dashboard.

# The Contract

The Federated Modules Dashboard requires two verbs on the same URL; GET and POST.

## Getting latest and available versions

To get the latest version as well as the list of available versions the Dashboard will GET `[BASE_URL]/[app]`. For example, if the base URL is `http://localhost:3010` then if the Dashboard wants to get the data for the `home` application it will execute an HTTP GET on `http://localhost:3010/home`. The resulting JSON has the following format:

```json
{
  "versions": [ "1.0.0", ... ],
  "latest": "1.0.0",
  "override": []
}
```

The `versions` key is an array of strings with the version names. And the `latest` key holds the latest version. The `latest` version _must_ be listed in the array of all possible versions.

## Override versions

Optionally you can specify the version of a remote that a given application can consume as a remote. For example, if you see this when you GET `http://localhost:3010/home`.

```json
{
  "versions": [ "1.0.0", ... ],
  "latest": "1.0.0",
  "override": [ { "name": "dsl", "version": "1.0.1" } ]
}
```

Then the `home` application should consume the version of the `dsl` remote at `1.0.1`. If no override is specified it should use the most recent version of the `dsl` remote.

To set the override:

```shell script
> curl "http://localhost:3010/home/dsl" -X POST -d "{\"version\": \"1.0.0\"}" -H "content-type: application/json"
```

This will set the override for `dsl` on the `home` application to `1.0.0`.

And this:

```shell script
> curl "http://localhost:3010/home/dsl" -X POST -d "{}" -H "content-type: application/json"
```

Will unset the override and return it to the `latest` version.

## Setting the latest version

To set the latest version the Dashboard will execute a POST http request on `[BASE_URL]/[app]`. For example, if the base URL is `http://localhost:3010` then if the Dashboard wants to set the version of the `home` application to `1.1.0` it will execute an HTTP POST on `http://localhost:3010/home` with a JSON payload of:

```json
{
  "version": "1.1.0"
}
```
