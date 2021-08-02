const fs = require("fs");
const merge = require("deepmerge");
const cliProgress = require("cli-progress");
const psi = require("psi");
const { privateConfig } = require("../src/config");
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
import Promise from "bluebird";

const RUNS = 30;
let hasStarted = false;

const launchPageSpeedInsightsLighthouse = async (url, desktop, failed) => {
  const mode = desktop ? "desktop" : "mobile";
  const opts = {
    key: privateConfig.PAGESPEED_KEY,
    strategy: mode,
    threshold: 0,
  };
  if (!hasStarted) {
    console.log("MODE:", mode);
    console.log("using PageSpeedInsights for Perf Test\n");
    hasStarted = true;
    console.log("url:", url, "\n");
    console.log("Warming CDN Cache...\n");
    await psi(url, opts);
    console.log("done warming");
    bar1.start(RUNS, 0);
  }
  if (failed) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }
  try {
    const data2 = await psi(url, opts);

    return {
      js: data2.data.lighthouseResult,
      json: JSON.stringify(data2.data.lighthouseResult),
    };
  } catch (e) {
    console.log("lighthouse test failed, running again", e);
    return launchPageSpeedInsightsLighthouse(url, true, true);
  }
};

const average = (array) =>
  toFixed(array.reduce((a, b) => a + b) / array.length, 2);

function toFixed(num, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)[0];
}

export const init = (url, title, desktop = true) => {
  const mode = desktop ? "desktop" : "mobile";

  if (url) {
    const urlObj = new URL(url);
    let dirName = urlObj.host.replace("www.", "");
    if (urlObj.pathname !== "/") {
      dirName = dirName + urlObj.pathname.replace(/\//g, "_");
    }

    dirName = "public/reports/" + dirName;

    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    const runner = async (title) => {
      let fakeArray = [];
      let tracker = [];
      for (let i = 1; i <= RUNS; i++) {
        fakeArray.push("");
      }
      const promResults = Promise.map(
        fakeArray,
        async () => {
          const taskRunResult = await launchPageSpeedInsightsLighthouse(
            url,
            desktop
          );
          tracker.push("");
          bar1.update(tracker.length);
          delete taskRunResult.js.stackPacks;
          delete taskRunResult.js.configSettings;
          delete taskRunResult.js.categoryGroups;
          delete taskRunResult.js.environment;
          delete taskRunResult.js.userAgent;
          delete taskRunResult.js.i18n;
          delete taskRunResult.i18n;
          delete taskRunResult.js.audits["screenshot-thumbnails"];
          delete taskRunResult.js.audits["final-screenshot"];
          delete taskRunResult.js.audits["full-page-screenshot"];

          return taskRunResult;
        },
        { concurrency: 3 }
      );
      const testResults = await promResults;
      if (title) {
        const scatterData = {
          [title]: testResults.map(({ js }) => {
            return js;
          }),
        };

        fs.readFile(
          `${dirName}/scatter.json`,
          "utf8",
          function readFileCallback(err, data) {
            if (err) {
              fs.writeFileSync(
                `${dirName}/scatter.json`,
                JSON.stringify({ ...scatterData, meta: { url } }),
                "utf8"
              ); // write it back
            } else {
              const oldScatterData = JSON.parse(data); //now it an object

              Object.keys(oldScatterData).map((key) => {
                if (Array.isArray(oldScatterData[key])) {
                  oldScatterData[key] = oldScatterData[key].map((oldData) => {
                    delete oldData.timing;
                    delete oldData.audits["screenshot-thumbnails"];
                    delete oldData.audits["final-screenshot"];
                    delete oldData.audits["network-requests"];
                    delete oldData.audits["uses-long-cache-ttl"];
                    return oldData;
                  });
                }
              });

              const json = JSON.stringify(
                Object.assign(oldScatterData, scatterData)
              ); //convert it back to json
              fs.writeFileSync(`${dirName}/scatter.json`, json, "utf8");
            }
          }
        );
      }
      return testResults;
    };

    return runner(title)
      .then((allResults) => {
        bar1.stop();
        console.log("\n");
        hasStarted = false;

        const averageAudit = Object.assign({}, allResults[0]);
        const auditKeys = Object.keys(allResults[0].js.audits);
        const avg = {};
        allResults.forEach(({ js: { audits } }) => {
          auditKeys.forEach((key) => {
            if (!audits[key]) {
              return;
            }
            if (!audits[key].numericValue) {
              return;
            }
            if (!avg[key]) {
              avg[key] = [];
            }
            avg[key].push(audits[key].numericValue);
          });
        });
        Object.entries(avg).forEach(([key, value]) => {
          avg[key] = { numericValue: average(value) };
        });
        const averagedJson = merge.all([averageAudit.js.audits, avg]);
        Object.assign(averageAudit.js, {
          audits: averagedJson,
          variant: title,
          mode,
        });
        averageAudit.json = JSON.stringify(
          Object.assign(JSON.parse(averageAudit.json), {
            audits: averagedJson,
            variant: title,
            mode,
          })
        );
        return averageAudit;
      })
      .then((results) => {
        fs.writeFile(
          `${dirName}/${results.js["fetchTime"].replace(/:/g, "_")}.json`,
          results.json,
          (err) => {
            if (err) throw err;
          }
        );
      });
  } else {
    throw "You haven't passed a URL to Lighthouse";
  }
};
