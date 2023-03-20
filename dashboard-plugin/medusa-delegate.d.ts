declare module "medusa-delegate" {
  type FetchClient = typeof fetch;
  type Environment = string | undefined;

  interface RemoteResponse {
    // Define the shape of the response object here
  }

  interface DelegateOptions {
    fetchClient?: FetchClient;
    environment?: Environment;
    currentHost?: string;
    remote: string;
    token: string;
    apiHost?: string;
  }

  function medusaDelegate({
    fetchClient,
    environment,
    currentHost,
    remote,
    token,
    apiHost
  }: DelegateOptions): Promise<unknown>;

  export default medusaDelegate;
}
