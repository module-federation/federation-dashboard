"use strict";

const AWS = require("aws-sdk");
const { memoize } = require("lodash");

const config = require("./config");

const secrets = new AWS.SecretsManager();

const { serviceName, tier } = config.get("universal.env");

/**
 * Get a secret value from config.mockSecrets or AWS Secrets Manager
 *
 * If `config.mockSecrets` is false, will use AWS Secrets Manager
 * Otherwise, looks for `config.mockSecrets.<name>` and will error if that is not set
 *
 * **IMPORTANT**: This is memoized, meaning it's cached per lambda. All active
 * lambdas will need to be restarted in order to obtain new secret values if
 * secrets are changed
 *
 * @param {string} name - Secret name (key)
 * @returns {Promise.<string>} Secret value
 */
module.exports = memoize(async (name) => {
  const mockSecrets = config.get("server.mockSecrets");
  if (mockSecrets) {
    return config.get(`server.mockSecrets.${name}`);
  }

  const secretId = `tf-${serviceName}-${tier}-secret-${name}`;
  const { SecretString } = await secrets
    .getSecretValue({
      SecretId: secretId,
    })
    .promise();

  return SecretString;
});
