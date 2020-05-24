# Simple Mock Version Manager

The Federated Module Dashboard connects to a version manager server to get and set the current versions of the applications in production.

This simple mock server implements the contract so that you can use it as a starting point for whatever implementation you decide to write.

## Installation

```sh
% yarn
```

## Running the server

```sh
% yarn start
```

## Extending the data

Simply edit the `versions.json` file at any time, even when the server is currently running, to add applications, versions, or change the current version.

## Implementation details

This mock server also implements a GET endpoint on `/` that will return all the current version information. This functionality is provided for demonstration purposed only and is _not_ required by the Federated Modules dashboard.

# The Contract

The Federated Modules Dashboard requires two verbs on the same URL; GET and POST.

## Getting current and available versions

To get the current version as well as the list of available versions the Dashboard will GET `[BASE_URL]/[app]`. For example, if the base URL is `http://localhost:3010` then if the Dashboard wants to get the data for the `home` application it will execute an HTTP GET on `http://localhost:3010/home`. The resulting JSON has the following format:

```json
{
  "versions": [ "1.0.0", ... ],
  "current: "1.0.0"
}
```

The `versions` key is an array of strings with the version names. And the `current` key holds the current version. The `current` version _must_ be listed in the array of all possible versions.

## Setting the current version

To set the current version the Dashboard will execute a POST http request on `[BASE_URL]/[app]`. For example, if the base URL is `http://localhost:3010` then if the Dashboard wants to set the version of the `home` application to `1.1.0` it will execute an HTTP POST on `http://localhost:3010/home` with a JSON payload of:

```json
{
  "version": "1.1.0"
}
```
