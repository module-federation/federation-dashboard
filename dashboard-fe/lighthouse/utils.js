const randomColor = require("randomcolor");
const arraystat = require("arraystat");
const cache = {};
const toFixed = (num, fixed) => {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  return num.toString().match(re)[0];
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
const generateScatterChartData = async (data) => {
  const workerize = __non_webpack_require__("node-inline-worker");
  const generateScatterChartDataWorker = workerize(async (data) => {
    const { toFixed } = __non_webpack_require__(require.resolve("./utils"));
    return Object.entries(data).map(([group, results]) => {
      const obj = {
        type: "scatter",
        name: group,
        showInLegend: true,
        markerType: "circle",
        // markerColor: randomColor(),
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
  });
  return generateScatterChartDataWorker(data);
};

const generateTimeSeriesScatterChartData = async (data) => {
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

const generateWhiskerChartData = (data) => {
  const workerize = __non_webpack_require__("node-inline-worker");
  const generateWhiskerChartDataWorker = workerize(async (data) => {
    const arraystat = __non_webpack_require__("arraystat");
    const { toFixed } = __non_webpack_require__(require.resolve("./utils"));

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
  });
  return generateWhiskerChartDataWorker(data);
};
const generateMultiSeriesChartData = (data) => {
  const workerize = __non_webpack_require__("node-inline-worker");
  const generateMultiSeriesChartDataWorker = workerize(async (data) => {
    const arraystat = __non_webpack_require__("arraystat");
    const { toFixed } = __non_webpack_require__(require.resolve("./utils"));

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
  });
  return generateMultiSeriesChartDataWorker(data);
};

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
  removeMeta,
  makeIDfromURL,
  generateMultiSeriesChartData,
  generateWhiskerChartData,
  hexToRgbA,
  generateScatterChartData,
  toFixed,
  cache,
  generateTimeSeriesScatterChartData,
};
