import fs from "fs";
import { init } from "./lib";
import Promise from "bluebird";
import { cache } from "./utils";
import bus from "../src/event-bus";
import dbDriver from "../src/database/drivers";

const generateLighthouseReport = (group) => {
  const { trackedURLs } = group.settings;
  // const updatedTracedURLs = trackedURLs.reduce((acc,trackedURL)=>{
  //   const clonedTracedUrl = Object.assign({},trackedURL)
  //   const updatedVariants = clonedTracedUrl.variants.map((variant)=>{
  //     return Object.assign({},variant,{new:false})
  //   })
  //   acc.push(Object.assign(clonedTracedUrl,{variants:updatedVariants}))
  //   return acc
  // },[])

  Promise.map(
    trackedURLs,
    async ({ url, variants }) => {
      const updatedVariants = await Promise.map(
        variants,
        async (variant) => {
          const { name, search, new: isNew } = variant;
          if (!isNew) {
            return variant;
          }
          let testLink = url;
          if (search && !testLink.includes(search)) {
            testLink = testLink + search;
          }
          variant.new = false;
          Object.assign(cache, { foundNew: true });
          await init(testLink, name || "Latest", true);
          return variant;
        },
        { concurrency: 1 }
      );
      return {
        url,
        variants: updatedVariants,
      };
    },
    { concurrency: 1 }
  ).then(async (updatedTrackedURLs) => {
    if (cache.foundNew) {
      const grp = await dbDriver.group_find(group.id);
      Object.assign(cache, { foundNew: false });
      group.settings.trackedURLs = updatedTrackedURLs;
      grp.settings = group.settings;
      return dbDriver.group_update(grp);
    } else {
      console.log("nothing new to update on DB");
    }
  });
};

const subs = async (type, payload) => {
  if (type === "groupUpdated" && payload?.settings?.trackedURLs) {
    generateLighthouseReport(payload);
  }
};
bus.subscribe(subs);
