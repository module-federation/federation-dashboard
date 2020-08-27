import fs from "fs";
import { init } from "./lib";
import Promise from "bluebird";
import { cache } from "./utils";
import bus from "../src/event-bus";
import fetch from "node-fetch";
import {dashboardGraphQLEndpoint} from "../../dashboard-data-creator/builder";

const generateLighthouseReport = ({ settings }) => {
  const { trackedURLs } = settings;

  Promise.map(trackedURLs, async ({ url, variants }) => {
    return Promise.map(variants, async (variant) => {
      const { name, search, new: isNew } = variant;
      if (!isNew) {
        return variant;
      }
      let testLink = url;
      if (search) {
        testLink = testLink + search;
      }
      return init(testLink, name, name || "Latest").then(()=>{
        fetch(dashboardGraphQLEndpoint, {
          method: "POST",
          body: JSON.stringify({
            variables: {
              group: this.payload.group,
              application: this.payload.id,
              name,
              date,
              value,
            },
            query: `mutation ($group: String!, $application: String!, $name: String!, $date: String!, $value: Float!) {
            addMetric(group: $group, application: $application, name: $name, date: $date, value: $value)
          }`,
          }),
          headers: {
            "Content-type": "application/json",
          },
        });
      })
    });
  });
  return;
  return Promise.map(
    sourceData,
    async ({ name, url, new: isNew }) => {
      if (!isNew) {
        return;
      }
      // if (!sourceData.name) {
      //   fs.writeFileSync(
      //     "public/urls.json",
      //     JSON.stringify(sourceData) || "[]"
      //   );
      // }
      return init(url, name || "Latest").then(() => {
        const freshDataSource = JSON.parse(
          fs.readFileSync("public/urls.json", "utf8")
        );

        const wr = Object.values(freshDataSource).map((x) => {
          if (x.url === url && x.name === name) {
            x.new = false;
          }
          return x;
        });

        const write = wr.reduce((acc, item) => {
          acc[`${item.url}-${item.name}`] = item;
          return acc;
        }, freshDataSource);
        if (!sourceData.name) {
          fs.writeFileSync("public/urls.json", JSON.stringify(write));
        }
      });
    },
    { concurrency: 1 }
  ).then(() => {
    Object.assign(cache, { running: false });
  });
};
const subs = async (type, payload) => {
  if (type === "groupUpdated") {
    generateLighthouseReport(payload);
  }
};
bus.subscribe(subs);

// export default async (req, res) => {
//   res.statusCode = 200;
//   if (!req.body) {
//     res.json({ message: "All Good" });
//     return;
//   }
//   let sourceData = JSON.parse(req.body);
//
//   let prev = JSON.parse(fs.readFileSync("public/urls.json", "utf8"));
//   sourceData.reduce((acc, item) => {
//     acc[`${item.url}-${item.name}`] = item;
//     return acc;
//   }, prev);
//
//   fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));
//
//   console.log("cache", cache);
//
//   if (cache.running) {
//     Object.assign(cache, { queue: true });
//
//     fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));
//
//     console.log("added to cache");
//     res.json({ message: "Queued" });
//     return;
//   }
//   sourceData = Object.values(
//     JSON.parse(fs.readFileSync("public/urls.json", "utf8"))
//   );
//   Object.assign(cache, { running: true });
//   generateLighthouseReport(sourceData).then(() => {
//     if (cache.queue) {
//       Object.assign(cache, { queue: false });
//       generateLighthouseReport(
//         Object.values(JSON.parse(fs.readFileSync("public/urls.json", "utf8")))
//       );
//     }
//   });
//
//   res.json({ message: "All Good" });
// };
