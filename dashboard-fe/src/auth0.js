import { initAuth0 } from "@auth0/nextjs-auth0";
import { privateConfig, publicConfig } from "./config";

export default publicConfig.WITH_AUTH
  ? initAuth0({
      clientID: privateConfig.AUTH0_CLIENT_ID,
      secret: privateConfig.AUTH0_CLIENT_SECRET,
      issuerBaseURL: privateConfig.AUTH0_ISSUER_BASE_URL,
      baseURL: privateConfig.AUTH0_BASE_URL,
    })
  : {
      withPageAuthRequired() {},
      handleLogin() {},
      handleProfile() {},
      getSession() {
        return { noAuth: true };
      },
    };
