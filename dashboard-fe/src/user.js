import fetch from "isomorphic-unfetch";

// Use a global to save the user, so we don't have to fetch it again after page navigations
let userState;

export const fetchUser = async () => {
  if (userState !== undefined) {
    return userState;
  }

  const res = await fetch("/api/me");
  userState = res.ok ? await res.json() : null;
  return userState;
};
