declare module "postDashboardData" {
    import { HeadersInit } from "node-fetch";

    interface PostDashboardDataOptions {
        data: string;
        headers?: HeadersInit;
    }

    export default function postDashboardData(options: PostDashboardDataOptions): Promise<void>;
}
