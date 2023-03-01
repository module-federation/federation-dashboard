declare module "upload" {
    import { RequestInit, Response } from "node-fetch";

    type PostDashboardDataOptions = {
        data: object;
        headers: object;
    };

    type PostDashboardDataClient = (url: string, options: RequestInit) => Promise<Response>;

    type PostDashboardDataFunction = (options: PostDashboardDataOptions) => Promise<void>;

    export default function postDashboardData(
        this: {
            _options: {
                fetchClient?: PostDashboardDataClient;
                dashboardURL: string;
            };
        },
        options: PostDashboardDataOptions,
    ): Promise<void>;
}
