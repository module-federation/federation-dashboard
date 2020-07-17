import bus from "./event-bus";
import dbDriver from "./database/drivers";
import fetch from "node-fetch";

const hookSusbscriber = async (type, payload) => {
  const settings = await dbDriver.siteSettings_get();
  return Promise.all(
    settings.webhooks
      .filter(({ event }) => event === type)
      .map(({ url }) =>
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