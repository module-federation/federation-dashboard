import bus from "./event-bus";
import dbDriver from "./database/drivers";
import fetch from "node-fetch";
import "../lighthouse/add-url";

const hookSusbscriber = async (type: any, payload: any) => {
  return null;
  await dbDriver.setup();
  const [settings] = await dbDriver.siteSettings_get();
  return Promise.all(
    settings.webhooks
      .filter(({ event }: any) => event === type)
      .map(({ url }: any) =>
        fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            payload,
          }),
        })
      )
  );
};

bus.subscribe(hookSusbscriber);
