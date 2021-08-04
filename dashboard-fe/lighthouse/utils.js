const randomColor = require("randomcolor");
const arraystat = require("arraystat");
const workerpool = require("workerpool");

const pool = workerpool.pool({
  options: {
    minWorkers: 3,
    maxQueueSize: 8,
    timeout: 6000,
    workerType: "auto",
  },
});
const cache = {};

const toFixed = (num, fixed) => {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");

  return num.toString().match(re)[0];
};
const getReport = async (safePath) => {
  if (!process.browser) {
    return pool
      .exec(createWorker, [safePath, "./utils", "getReportWorker"])
      .then(function (result) {
        return result;
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function (result) {
        return result;
      });
  }
};
const getReportWorker = async (safePath) => {
  if (!process.browser) {
    const fs = __non_webpack_require__("fs");
    const path = __non_webpack_require__("path");

    function getData(fileName, type) {
      return fs.promises.readFile(fileName, { encoding: type });
    }

    return await getData(
      path.join(process.cwd(), "public/reports", safePath, "scatter.json"),
      "utf8"
    ).catch(() => "{}");
  }
};

const hexToRgbA = (hex, tr) => {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
      "," +
      tr +
      ")"
    );
  }
  throw new Error("Bad Hex");
};

const generateScatterChartProcessor = (data) => {
  return Object.entries(data).map(([group, results]) => {
    const obj = {
      type: "scatter",
      name: group,
      showInLegend: true,
      markerType: "circle",
    };
    const charable = (Array.isArray(results) ? results : [results]).map(
      (result) => {
        return [
          "first-contentful-paint",
          "first-meaningful-paint",
          "speed-index",
          "estimated-input-latency",
          "total-blocking-time",
          "max-potential-fid",
          "time-to-first-byte",
          "first-cpu-idle",
          "interactive",
          "accessibility",
          "seo",
          "largest-contentful-paint",
        ]
          .filter((key) => result.audits[key])
          .map((key, index) => {
            return {
              y: parseInt(toFixed(result.audits[key].numericValue)),
              x: index,
              label: key,
            };
          });
      }
    );
    obj.dataPoints = [].concat.apply([], charable);
    return obj;
  });
};

const createWorker = async (data, request, moduleExport) => {
  if (!process.browser) {
    const path = __non_webpack_require__("path");
    // could also make this an external, then just use "require"
    const initRemote = __non_webpack_require__(
      // needs webpack runtime to get __webpack_require__
      // externally require the worker code with node.js This could be inline,
      // but i decided to move the bootstapping code somewhere else. Technically if this were not next.js
      // we should be able to import('dashboard/utils')
      // workers/index.js was in this file, but its cleaner to just move the boilerplate
      path.join(process.cwd(), "workers/index.js")
    );

    // essentially do what webpack is supposed to do in a proper environment.
    // attach the remote container, initialize share scopes.
    // The webpack parser does something similer when you require(app1/thing), so make a RemoteModule
    let remoteLocation
    if(fs.existsSync(path.join(process.cwd(),".next/server/static/runtime/remoteEntry.js"))) {
      remoteLocation = ".next/server/static/runtime/remoteEntry.js"
    } else {
      remoteLocation = ".next/server/chunks/static/runtime/remoteEntry.js"
    }


    const federatedRequire = await initRemote(
      path.join(
        process.cwd(),
        remoteLocation
      ),
      () => ({
        initSharing: __webpack_init_sharing__,
        shareScopes: __webpack_share_scopes__,
      })
    );
    // the getter, but abstracted. This async gets the module via the low-level api.
    // The remote requires utils (basically this file lol) and i pull toFixed off its exports.
    // alternatively i could copy paste, but MF provides me the power to import the current file as an entrypoint
    const RemoteModule = await federatedRequire(request);
    return RemoteModule[moduleExport](data);
  }
};

const generateScatterChartData = async (data) => {
  if (!process.browser) {
    return pool
      .exec(createWorker, [data, "./utils", "generateScatterChartProcessor"])
      .then(function (result) {
        return result;
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function (result) {
        return result;
      });
  }

  return {};
};

const generateTimeSeriesScatterChartData = (data) => {
  const scatterObject = [
    "first-contentful-paint",
    "first-meaningful-paint",
    "speed-index",
    "estimated-input-latency",
    "total-blocking-time",
    "max-potential-fid",
    "time-to-first-byte",
    "first-cpu-idle",
    "interactive",
    "accessibility",
    "seo",
    "largest-contentful-paint",
  ].reduce((acc, item) => {
    const obj = {
      type: "spline",
      name: item,
      showInLegend: true,
      // markerType: "dot",
      dataPoints: [],
      xValueType: "dateTime",
    };
    acc[item] = obj;
    return acc;
  }, {});
  data.map((result, key) => {
    [
      "first-contentful-paint",
      "first-meaningful-paint",
      "speed-index",
      "estimated-input-latency",
      "total-blocking-time",
      "max-potential-fid",
      "time-to-first-byte",
      "first-cpu-idle",
      "interactive",
      "accessibility",
      "seo",
      "largest-contentful-paint",
    ]
      .filter((key) => result.audits[key])
      .forEach((key, index) => {
        scatterObject[key].dataPoints.push({
          y: parseInt(toFixed(result.audits[key].numericValue)),
          x: new Date(result.fetchTime).getTime(),
          // label: key,
        });
      });
  });
  return Object.values(scatterObject);
};

const generateWhiskerChartDataProcessor = (data) => {
  return Object.entries(data).map(([group, results]) => {
    // const generateColor = randomColor();
    const obj = {
      type: "boxAndWhisker",
      name: group,
      // upperBoxColor: hexToRgbA(generateColor, "0.3"),
      // lowerBoxColor: hexToRgbA(generateColor, "0.3"),
      showInLegend: true,
      // markerColor: generateColor,
      // color: generateColor,
    };
    const chartStore = { [group]: {} };
    results.map((result) => {
      return [
        "first-contentful-paint",
        "first-meaningful-paint",
        "speed-index",
        "estimated-input-latency",
        "total-blocking-time",
        "max-potential-fid",
        "time-to-first-byte",
        "first-cpu-idle",
        "interactive",
        "accessibility",
        "seo",
        "largest-contentful-paint",
      ]
        .filter((key) => result.audits[key])
        .map((key, index) => {
          if (!chartStore[group][key]) {
            chartStore[group][key] = [];
          }
          chartStore[group][key].push(
            parseInt(toFixed(result.audits[key].numericValue))
          );
        });
    });

    const charable = Object.entries(chartStore).map(([key, value]) => {
      return Object.entries(value).map(([key, value], index) => {
        const { min, q1, q3, max, median } = arraystat(value);

        return { label: key, y: [min, q1, q3, max, median], x: index };
      });
    });
    obj.dataPoints = [].concat.apply([], charable);
    return obj;
  });
};

const generateWhiskerChartData = (data) => {
  if (!process.browser) {
    return pool
      .exec(createWorker, [
        data,
        "./utils",
        "generateWhiskerChartDataProcessor",
      ])
      .then(function (result) {
        return result;
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function (result) {
        return result;
      });
  }
  return {};
};

const generateMultiSeriesChartProcessor = (data) => {
  const metricGroups = [
    "first-contentful-paint",
    "first-meaningful-paint",
    "speed-index",
    "estimated-input-latency",
    "total-blocking-time",
    "max-potential-fid",
    "time-to-first-byte",
    "first-cpu-idle",
    "interactive",
    "accessibility",
    "seo",
    "largest-contentful-paint",
  ].reduce((acc, item) => {
    acc[item] = {
      // color: randomColor(),
      name: item,
      type: "bar",
      showInLegend: true,
      dataPoints: [],
    };
    return acc;
  }, {});

  Object.entries(data).map(([group, results]) => {
    // const generateColor = randomColor();

    const chartStore = { [group]: {} };
    results.map((result) => {
      return [
        "first-contentful-paint",
        "first-meaningful-paint",
        "speed-index",
        "estimated-input-latency",
        "total-blocking-time",
        "max-potential-fid",
        "time-to-first-byte",
        "first-cpu-idle",
        "interactive",
        "accessibility",
        "seo",
        "largest-contentful-paint",
      ]
        .filter((key) => result.audits[key])
        .map((key, index) => {
          if (!chartStore[group][key]) {
            chartStore[group][key] = [];
          }
          chartStore[group][key].push(
            parseInt(toFixed(result.audits[key].numericValue))
          );
        });
    });

    Object.entries(chartStore).forEach(([key, value]) => {
      return Object.entries(value).forEach(([key, value], index) => {
        const { min, q1, q3, max, median } = arraystat(value);
        const result = {
          group: group,
          label: key,
          y: [min, q1, q3, max, median],
          x: index,
        };
        metricGroups[key].dataPoints.push({ label: group, y: median });
      });
    });
  });

  return Object.values(metricGroups);
};
const generateMultiSeriesChartData = (data) => {
  if (!process.browser) {
    return pool
      .exec(createWorker, [
        data,
        "./utils",
        "generateMultiSeriesChartProcessor",
      ])
      .then(function (result) {
        return result;
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function (result) {
        return result;
      });
  }
  return {};
};
const generateUserTimings = data => {
  return Object.entries(data).reduce((acc,[group,results])=>{
    console.log(results);
    acc[group] = results.reduce((acc1,result)=>{
      const res = {}
      res.fetchTime = result.fetchTime
      res.timings = result.audits['user-timings'].details.items.map(detail=>{
        return {name: detail.name,duration: detail.duration || detail.startTime}
      })
      acc1.push(res)
      return acc1
    },[]);
    console.log(acc);
    return acc
  },{})
}
const makeIDfromURL = (url) => {
  const urlObj = new URL(url);
  let id = urlObj.host.replace("www.", "");
  if (urlObj.pathname !== "/") {
    id = id + urlObj.pathname.replace(/\//g, "_");
  }
  return { id, url: urlObj.origin + urlObj.pathname, search: urlObj.search };
};

const removeMeta = (obj) => {
  for (let prop in obj) {
    if (prop === "__typename") delete obj[prop];
    else if (typeof obj[prop] === "object") removeMeta(obj[prop]);
  }
};
module.exports = {
  createWorker,
  removeMeta,
  makeIDfromURL,
  generateMultiSeriesChartData,
  generateWhiskerChartData,
  hexToRgbA,
  generateScatterChartData,
  toFixed,
  cache,
  pool,
  generateTimeSeriesScatterChartData,
  generateScatterChartProcessor,
  generateWhiskerChartDataProcessor,
  generateMultiSeriesChartProcessor,
  getReport,
  getReportWorker,
  generateUserTimings
};
