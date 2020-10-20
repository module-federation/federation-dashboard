const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const argv = require("yargs").argv;
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const merge = require("deepmerge");
const cliProgress = require("cli-progress");
const psi = require("psi");
const config = require("../src/config");
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
import Promise from "bluebird";
import ReadJSONStream from "read-json-stream";

const RUNS = 30;
let hasStarted = false;

const launchChromeAndRunLighthouse = async (url) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless",
      "--disable-gpu",
      "--disable-cache",
      "--disable-extensions",
    ],
  });
  const opts = {
    port: chrome.port,
  };

  if (!hasStarted) {
    hasStarted = true;
    console.log("using Local Lighthouse for Perf Test\n");
    console.log("url:", url, "\n");
    console.log("Warming CDN Cache...\n");
    await Promise.all([
      lighthouse(url, opts),
      lighthouse(url, opts),
      lighthouse(url, opts),
    ]);
    bar1.start(RUNS, 0);
  }
  console.log("starting test");
  return lighthouse(url, opts)
    .then((results) => {
      try {
        results.lhr.audits.metrics.details.items[0];
        return chrome.kill().then(() => {
          return {
            js: results.lhr,
            json: results.report,
          };
        });
      } catch (e) {
        return chrome.kill().then(() => {
          return launchChromeAndRunLighthouse(url);
        });
      }
    })
    .catch((error) => {
      if (chrome.kill) {
        return chrome.kill().then(() => {
          return launchChromeAndRunLighthouse(url);
        });
      }
      return launchChromeAndRunLighthouse(url);
    })
    .catch((error) => {
      console.error(error);
      return launchChromeAndRunLighthouse(url);
    });
};
const launchPageSpeedInsightsLighthouse = async (url, desktop) => {
  const mode = desktop ? "desktop" : "mobile";
  const opts = {
    key: config.PAGESPEED_KEY,
    strategy: mode,
    threshold: 0,
  };
  if (!hasStarted) {
    console.log("MODE:", mode);
    console.log("using PageSpeedInsights for Perf Test\n");
    hasStarted = true;
    console.log("url:", url, "\n");
    console.log("Warming CDN Cache...\n");
    await Promise.all([
      await psi(url, opts),
      await psi(url, opts),
      await psi(url, opts),
    ]);
    bar1.start(RUNS, 0);
  }
  try {
    const data2 = await psi(url, opts);

    return {
      js: data2.data.lighthouseResult,
      json: JSON.stringify(data2.data.lighthouseResult),
    };
  } catch (e) {
    return launchPageSpeedInsightsLighthouse(url);
  }
};

const getContents = (pathStr) => {
  const output = fs.readFileSync(pathStr, "utf8", (err, results) => {
    return results;
  });
  return JSON.parse(output);
};

const average = (array) =>
  toFixed(array.reduce((a, b) => a + b) / array.length, 2);

function toFixed(num, fixed) {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)[0];
}

export const init = (url = argv.url, title = argv.title, desktop = true) => {
  argv.url = url;
  argv.title = title;
  const mode = desktop ? "desktop" : "mobile";

  if (argv.url) {
    const urlObj = new URL(argv.url);
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
          const taskRunResult = config.USE_CLOUD
            ? await launchPageSpeedInsightsLighthouse(argv.url, desktop)
            : await launchChromeAndRunLighthouse(argv.url);
          tracker.push("");
          bar1.update(tracker.length);
          delete taskRunResult.js.stackPacks;
          delete taskRunResult.js.configSettings;
          delete taskRunResult.js.categoryGroups;
          delete taskRunResult.js.environment;
          delete taskRunResult.js.userAgent;
          delete taskRunResult.js.i18n;
          delete taskRunResult.js.audits["screenshot-thumbnails"];
          delete taskRunResult.js.audits["final-screenshot"];
          return taskRunResult;
        },
        { concurrency: config.USE_CLOUD ? 10 : 1 }
      );
      const testResults = await promResults;
      if (title) {
        const scatterData = {
          [title]: testResults.map(({ js }) => {
            return js;
          }),
        };
        ReadJSONStream(`${dirName}/scatter.json`) // filePath is a file path string e.g. 'data/myData.json' or 'path.join('data', 'myData.json');
          .done((err, data) => {
            if (err) {
              // handle error
            } else {
              console.log(data);
              // var stream = fs.createWriteStream('myFile.txt', {flags: 'a'});
              //   var data = "Hello, World!\n";
              ////  stream.write(data, function() {
              // Now the data has been written.
              //  });
            }
          });
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
              fs.writeFileSync(
                `${dirName}/scatter.json`,
                json,
                "utf8",
                () => {}
              );
            }
          }
        );
      }
      return testResults;
    };

    return runner(argv.title)
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
        const prevReports = glob(`${dirName}/*.json`, {
          sync: true,
          ignore: `${dirName}/scatter.json`,
        });

        if (prevReports.length) {
          let dates = [];
          for (let report in prevReports) {
            dates.push(
              new Date(path.parse(prevReports[report]).name.replace(/_/g, ":"))
            );
          }
          const max = dates.reduce(function (a, b) {
            return Math.max(a, b);
          });
          const recentReport = new Date(max).toISOString();

          const recentReportContents = getContents(
            dirName + "/" + recentReport.replace(/:/g, "_") + ".json"
          );
        }

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

// (async () => {
//   await init("https://stage.lululemon.com", "Stage Home AsyncLaunchPreload")
//   await init("https://stage.lululemon.com/c/womens-leggings/_/N-8s6", "Stage CDP AsyncLaunchPreload")
//   await init("https://stage.lululemon.com/p/women-pants/Align-Pant-2/_/prod2020012?color=0001&sz=2", "Stage PDP AsyncLaunchPreload")
// })()
// init("https://stage.lululemon.com/c/womens-leggings/_/N-8s6","Baseline")
/*



node lib.js --url "https://stage.lululemon.com/shop/mybag"

node lib.js --url "https://stage.lululemon.com/checkout/spk/index.jsp"

node lib.js --url "https://shop.lululemon.com/p/women-pants/Align-Pant-2/_/prod2020012?color=0002"

node lib.js --url "https://stage.lululemon.com/c/womens-leggings/_/N-8s6" && node lib.js --url "https://stage.lululemon.com" && node lib.js --url "https://stage.lululemon.com/p/women-pants/Align-Pant-2/_/prod2020012?color=0001&sz=2"








*/
