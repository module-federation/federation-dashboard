import React, { Component } from "react";

import auth0 from "../src/auth0";
import { fetchUser } from "../src/user";
import createLoginUrl from "../src/url-helper";
import RedirectToLogin from "./login-redirect";
import { publicConfig } from "../src/config";

export default function withAuth(InnerComponent) {
  if (!publicConfig.WITH_AUTH) {
    const NoAuth = props => {
      return <InnerComponent {...props} user={null} />;
    };
    return NoAuth;
  }
  return class Authenticated extends Component {
    static async getInitialProps(nextCtx) {
      const { ctx } = nextCtx;
      const pageProps = await InnerComponent?.getInitialProps?.(ctx);
      if (!process.browser) {
        const session = await auth0.getSession(ctx.req);

        if (!session || !session.user) {
          ctx.res.writeHead(302, {
            Location: createLoginUrl(ctx.req.url)
          });
          ctx.res.end();
          return;
        }
        return { ...pageProps, user: session.user };
      }
      const user = await fetchUser();

      return { ...pageProps, user: user };
    }

    constructor(props) {
      super(props);
    }

    render() {
      if (!this.props.user) {
        return <RedirectToLogin />;
      }
      return <InnerComponent {...this.props} user={this.props.user} />;
    }
  };
}
