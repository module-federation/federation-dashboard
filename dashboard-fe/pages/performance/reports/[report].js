import React, { useRef, createRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import gql from "graphql-tag";
import LazyHydrate from "react-lazy-hydration";
const queryString = require("query-string");

import {
  generateScatterChartData,
  generateWhiskerChartData,
  generateMultiSeriesChartData,
  generateTimeSeriesScatterChartData,
  removeMeta,
  makeIDfromURL,
} from "../../../lighthouse/utils";

import Form from "../../../components/FormVarient";
import { useMutation, useQuery } from "@apollo/client";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

if (process.browser) {
  // try {import("dashboard/utils") } catch (e) {}
}
const isProd = process.env.NODE_ENV !== "development";

const hostname = isProd
  ? process.browser
    ? "http://mf-dash.ddns.net:3000/"
    : "http://localhost:3000/"
  : "http://localhost:3000/";

const CanvasJSChart = dynamic(
  async () => (await import("canvasjs-react-charts")).CanvasJSChart,
  { ssr: false }
);

const ADD_VARIENT = gql`
  mutation($settings: GroupSettingsInput!) {
    updateGroupSettings(group: "default", settings: $settings) {
      trackedURLs {
        url
        variants {
          name
          search
          new
        }
      }
    }
  }
`;

const WhiskerChart = React.memo((props) => {
  const [ready, setReady] = useState(false);
  const [gotRef, setRef] = useState(false);
  // const [setUrl] = useMutation(ADD_VARIENT);

  useEffect(() => {
    setReady(true);
  }, []);

  // const { data } = useQuery(GET_TRACKED, {
  //   variables: {
  //     group: "default"
  //   }
  // });
  //
  // React.useEffect(() => {
  //   if (data) {
  //     removeMeta(data.groups[0].settings.trackedURLs);
  //     setTodos(data.groups[0].settings.trackedURLs);
  //   }
  // }, [data]);

  if (!ready) {
    return <span>Loading Dataset</span>;
  }
  const whiskerChartOptions = {
    theme: "dark2",
    height: typeof window === "object" ? window.innerHeight : null,
    interactivityEnabled: true,
    zoomEnabled: true,
    zoomType: "y",
    title: {
      text: "Performance chart",
    },
    axisX: {
      title: "Metric Type",
    },
    axisY: {
      scaleBreaks: {
        autoCalculate: true, // change to false
      },
      includeZero: false,
      title: "Timing",
      suffix: "ms",
      logarithmic: false,
    },
    legend: {
      cursor: "pointer",
      itemclick: (e) => {
        props.toggleDataSeries(e);
        gotRef.render();
      },
    },

    data: props.whiskerChartData,
  };

  return (
    <CanvasJSChart
      options={whiskerChartOptions}
      onRef={(ref) => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const ScatterChart = React.memo((props) => {
  const [ready, setReady] = useState(false);
  const [gotRef, setRef] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) {
    return null;
  }
  const scatterChartOptions = {
    height: typeof window === "object" ? window.innerHeight : null,
    theme: "dark2",
    zoomEnabled: true,
    zoomType: "x",
    title: {
      text: "Scatter Chart",
    },
    axisX: {
      title: "Metric Type",
    },
    axisY: {
      title: "Timing",
      suffix: "ms",
      includeZero: false,
      logarithmic: true,
    },
    legend: {
      cursor: "pointer",
      itemclick: (e) => {
        props.toggleDataSeries(e);
        gotRef.render();
      },
    },

    data: props.scatterChartData,
  };
  return (
    <CanvasJSChart
      options={scatterChartOptions}
      onRef={(ref) => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const MultiSeriesChart = React.memo((props) => {
  const [ready, setReady] = useState(false);
  const [gotRef, setRef] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) {
    return null;
  }
  const multiSeriesChartOptions = {
    theme: "dark2",
    animationEnabled: true,
    title: {
      text: "Multi Series Chart - Medians",
    },
    axisY: {
      title: "Metric Type",
      includeZero: true,
    },
    legend: {
      cursor: "pointer",
      itemclick: (e) => {
        props.toggleDataSeries(e);
        gotRef.render();
      },
    },
    toolTip: {
      shared: true,
      // content: toolTipFormatter
    },
    data: props.multiSeriesChartData,
  };

  return (
    <CanvasJSChart
      options={multiSeriesChartOptions}
      onRef={(ref) => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const TimeSeriesChart = React.memo((props) => {
  const [data, setData] = useState(false);
  const [gotRef, setRef] = useState(false);
  const [isRecent, setRecent] = useState(false);
  const timeSeriesScatterChartOptions = {
    height: typeof window === "object" ? window.innerHeight : null,
    theme: "dark2",
    title: {
      text: "Scatter Chart",
    },
    axisX: {
      title: "Date",
      labelFormatter: function (e) {
        const { CanvasJS } = require("canvasjs-react-charts");

        return CanvasJS.formatDate(e.value, "DD MMM");
      },
    },
    axisY: {
      title: "Timing",
      suffix: "ms",
      includeZero: false,
      // logarithmic: true,
      // interval: 0.2,
      minimum: 500,
    },
    legend: {
      cursor: "pointer",
      itemclick: (e) => {
        props.toggleDataSeries(e);
        gotRef.render();
      },
    },

    data: data,
  };

  useEffect(() => {
    const { query } = props;
    // if (process.browser) {
    //   if (window.dashboard) {
    //     console.log(window.dashboard)
    //     window.dashboard.get("./utils");
    //   }
    // }
    fetch(hostname + "api/get-timeseries?report=" + query.report)
      .then((res) => res.json())
      .then((timeSeriesData) => {
        if (isRecent) {
          timeSeriesData = timeSeriesData.slice(
            Math.max(timeSeriesData.length - 5, 0)
          );
        }
        const timeSeriesScatterData = generateTimeSeriesScatterChartData(
          timeSeriesData
        );

        setData(timeSeriesScatterData);
      });
  }, [isRecent]);
  if (!data) {
    return null;
  }

  return (
    <>
      <CanvasJSChart
        options={timeSeriesScatterChartOptions}
        onRef={(ref) => {
          createRef(ref);
          setRef(ref);
        }}
      />
      <button onClick={() => setRecent(true)}>Show Last 10</button>
    </>
  );
});

const link = createHttpLink({
  uri: "/api/graphql",
});

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      queryValue: "",
      newQueryObject: {},
    };
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
    this.cache = new InMemoryCache({ addTypename: false });
    this.apolloClient = new ApolloClient({
      // Provide required constructor fields
      cache: this.cache,
      link: link,
      queryDeduplication: false,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "cache-and-network",
        },
      },
    });
  }

  toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
  }

  updateExistingQuery = () => {
    let value = null;
    try {
      console.log("is valid url");
      value = makeIDfromURL(this.state.queryValue).search;
    } catch (e) {
      console.log("is incomplete query param");
      value = this.state.queryValue;
    }
    let newQueryObject = queryString.parse(value);
    if (!newQueryObject) {
      newQueryObject = queryString.parse("?" + value);
    }
    this.setState(Object.assign({}, this.state, { newQueryObject }));
  };

  _handleSubmit = (e) => {
    let newQueryObject;
    if (this.state.queryValue) {
      this.updateExistingQuery();
    }
    e.preventDefault();

    // if (this.state.inputValue === "") return alert("Task name is required");

    this.apolloClient
      .query({
        query: gql`
          {
            groups(name: "default") {
              settings {
                trackedURLs {
                  url
                  variants {
                    name
                    search
                    new
                  }
                }
              }
            }
          }
        `,
      })
      .then(({ data }) => {
        if (data.groups[0].settings?.trackedURLs) {
          const { trackedURLs } = Object.create(data.groups[0].settings);

          const updatedTrackedUrls = trackedURLs.reduce((acc, tracked) => {
            const updatedExistingVariants = tracked.variants.reduce(
              (acc, variant) => {
                if (variant.name === this.state.inputValue) {
                  acc.push(Object.assign({}, variant, { new: true }));
                  return acc;
                }
                acc.push(variant);
                return acc;
              },
              []
            );
            const isNewVariant = !updatedExistingVariants.find((variant) => {
              return this.state.name === variant.name;
            });

            if (isNewVariant) {
              const { id } = makeIDfromURL(tracked.url);

              const OriginalTest = tracked.variants.find(({ name }) => {
                return name === "Latest";
              });
              if (id === this.props.query.report) {
                const originalQueryString = queryString.parse(
                  OriginalTest.search || ""
                );
                console.log(
                  "merged Query string",
                  Object.assign(originalQueryString, this.state.newQueryObject)
                );

                updatedExistingVariants.push({
                  name: this.state.inputValue,
                  search: originalQueryString
                    ? "?" +
                      queryString
                        .stringify(originalQueryString)
                        .replace("%2C", ",")
                    : "",
                  new: true,
                });
              }
            }
            acc.push(
              Object.assign({}, tracked, { variants: updatedExistingVariants })
            );
            return acc;
          }, []);

          return Object.assign({}, data.groups[0].settings, {
            trackedURLs: updatedTrackedUrls,
          });
        } else {
          return null;
        }
      })
      .then((updatedTrackedUrls) => {
        if (!updatedTrackedUrls) {
          return;
        }
        this.apolloClient.mutate({
          variables: { settings: updatedTrackedUrls },
          mutation: gql`
            mutation($settings: GroupSettingsInput!) {
              updateGroupSettings(group: "default", settings: $settings) {
                trackedURLs {
                  url
                  variants {
                    name
                    search
                    new
                  }
                }
              }
            }
          `,
        });
      })
      .then((...args) => {
        this.setState({ inputValue: "" });
      });

    // fetch("/api/add-url", {
    //   method: "POST",
    //   body: JSON.stringify([
    //     {
    //       name: this.state.inputValue,
    //       new: true,
    //       url: this.props.meta.url
    //     }
    //   ])
    // });
  };

  onDelete = (name) => {
    this.apolloClient
      .query({
        query: gql`
          {
            groups(name: "default") {
              settings {
                trackedURLs {
                  url
                  variants {
                    name
                    search
                    new
                  }
                }
              }
            }
          }
        `,
      })
      .then(({ data }) => {
        const { trackedURLs } = Object.create(data.groups[0].settings);
        const { report } = this.props.query;
        const groupToDeleteFrom = trackedURLs.reduce((acc, group) => {
          if (report === makeIDfromURL(group.url).id) {
            fetch("/api/remove-url", {
              method: "POST",
              body: JSON.stringify([
                {
                  name,
                  url: report,
                },
              ]),
            });
            const freshVariants = group.variants.filter((variant) => {
              return variant.name !== name;
            });
            const updatedGroup = Object.assign({}, group, {
              variants: freshVariants,
            });
            acc.push(updatedGroup);
            return acc;
          }
          acc.push(group);
          return acc;
        }, []);
        return Object.assign({}, data.groups[0].settings, {
          trackedURLs: groupToDeleteFrom,
        });
      })
      .then((updatedTrackedUrls) => {
        this.apolloClient.mutate({
          variables: { settings: updatedTrackedUrls },
          mutation: gql`
            mutation($settings: GroupSettingsInput!) {
              updateGroupSettings(group: "default", settings: $settings) {
                trackedURLs {
                  url
                  variants {
                    name
                    search
                    new
                  }
                }
              }
            }
          `,
        });
      })
      .then(() => {
        window.location.reload();
      });
  };

  render() {
    return (
      <>
        <div>
          <Form
            appKeys={this.props.appKeys}
            onSubmit={this._handleSubmit}
            onDelete={this.onDelete}
            values={this.state}
            onChange={(formObj) => {
              this.setState(Object.assign({}, this.state, formObj));
            }}  
          />
        </div>
        <div>
          <LazyHydrate whenIdle>
            <WhiskerChart
              whiskerChartData={this.props.whiskerChartData}
              toggleDataSeries={this.toggleDataSeries}
            />
          </LazyHydrate>
          <LazyHydrate whenIdle>
            <ScatterChart
              scatterChartData={this.props.scatterChartData}
              toggleDataSeries={this.toggleDataSeries}
            />
          </LazyHydrate>
          <MultiSeriesChart
            multiSeriesChartData={this.props.multiSeriesChartData}
            toggleDataSeries={this.toggleDataSeries}
          />
          <LazyHydrate whenIdle>
            <TimeSeriesChart
              query={this.props.query}
              multiSeriesChartData={this.props.multiSeriesChartData}
              toggleDataSeries={this.toggleDataSeries}
            />
          </LazyHydrate>
        </div>
      </>
    );
  }
}

Report.getInitialProps = async ({ query }) => {
  const { meta, ...report } = await fetch(
    hostname + "api/get-report?report=" + query.report
  ).then((res) => res.json());

  const [
    scatterChartData,
    whiskerChartData,
    multiSeriesChartData,
  ] = await Promise.all([
    generateScatterChartData(report),
    generateWhiskerChartData(report),
    generateMultiSeriesChartData(report),
  ]);
  return {
    scatterChartData,
    whiskerChartData,
    multiSeriesChartData,
    meta,
    appKeys: Object.keys(report),
    query,
  };
};
export default Report;
