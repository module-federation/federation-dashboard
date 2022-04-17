import { handleAuth } from "@auth0/nextjs-auth0";
console.log(process.env.AUTH0_CLIENT_SECRET);
export default handleAuth();
