declare module "medusa-client" {
  type FetchClient = typeof fetch;
  type Environment = string | undefined;

  interface RemoteResponse {
    // Define the shape of the response object here
  }

  type RemoteRequestOptions = {
    fetchClient?: FetchClient;
    environment?: Environment;
    currentHost?: string;
    remote: string;
    token: string;
    apiHost?: string;
  };

  function getRemote({
    fetchClient,
    environment,
    currentHost,
    remote,
    token,
    apiHost
  }: RemoteRequestOptions): Promise<RemoteResponse>;

  export default getRemote;
}
