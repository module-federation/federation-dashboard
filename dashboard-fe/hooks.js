import * as React from "react";
import { useAuth0 } from "@auth0/auth0-react";
const useLazyAuth = () => {
  const [render, rerender] = React.useState(0);
  React.useEffect(() => rerender(render + 1), []);
  const authResult = useAuth0();
  return React.useMemo(() => {
    if (render === 0) {
      return {
        isAuthenticating: false,
        isAuthenticated: false,
        isAuthorized: () => false,
        loginWithRedirect: () => {},
        logout: () => {},
        user: null,
        userId: null,
        authResult: null,
      };
    }
    return authResult;
  }, [render, authResult]);
};
export { useLazyAuth }
