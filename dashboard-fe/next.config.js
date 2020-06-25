module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        AUTH0_CLIENT_ID: JSON.stringify(process.env.AUTH0_CLIENT_ID),
        AUTH0_SCOPE: JSON.stringify(process.env.AUTH0_SCOPE),
        AUTH0_DOMAIN: JSON.stringify(process.env.AUTH0_DOMAIN),
        REDIRECT_URI: JSON.stringify(process.env.REDIRECT_URI),
        POST_LOGOUT_REDIRECT_URI: JSON.stringify(
          process.env.POST_LOGOUT_REDIRECT_URI
        ),
      })
    );
    return config;
  },
};
