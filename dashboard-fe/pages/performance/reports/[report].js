import React, { useRef, createRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  generateScatterChartData,
  generateWhiskerChartData,
  generateMultiSeriesChartData,
  generateTimeSeriesScatterChartData
} from "../../../lighthouse/utils";
import Form from "../../../components/FormVarient";

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

const WhiskerChart = React.memo(props => {
  const [ready, setReady] = useState(false);
  const [gotRef, setRef] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) {
    return null;
  }
  const whiskerChartOptions = {
    theme: "dark2",
    height: typeof window === "object" ? window.innerHeight : null,
    interactivityEnabled: true,
    zoomEnabled: true,
    zoomType: "y",
    title: {
      text: "Performance chart"
    },
    axisX: {
      title: "Metric Type"
    },
    axisY: {
      scaleBreaks: {
        autoCalculate: true // change to false
      },
      includeZero: false,
      title: "Timing",
      suffix: "ms",
      logarithmic: false,
      minimum: 500
    },
    legend: {
      cursor: "pointer",
      itemclick: e => {
        props.toggleDataSeries(e);
        gotRef.render();
      }
    },

    data: props.whiskerChartData
  };

  return (
    <CanvasJSChart
      options={whiskerChartOptions}
      onRef={ref => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const ScatterChart = React.memo(props => {
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
      text: "Scatter Chart"
    },
    axisX: {
      title: "Metric Type"
    },
    axisY: {
      title: "Timing",
      suffix: "ms",
      includeZero: false,
      logarithmic: true
    },
    legend: {
      cursor: "pointer",
      itemclick: e => {
        props.toggleDataSeries(e);
        gotRef.render();
      }
    },

    data: props.scatterChartData
  };
  return (
    <CanvasJSChart
      options={scatterChartOptions}
      onRef={ref => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const MultiSeriesChart = React.memo(props => {
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
      text: "Multi Series Chart - Medians"
    },
    axisY: {
      title: "Metric Type",
      includeZero: true
    },
    legend: {
      cursor: "pointer",
      itemclick: e => {
        props.toggleDataSeries(e);
        gotRef.render();
      }
    },
    toolTip: {
      shared: true
      // content: toolTipFormatter
    },
    data: props.multiSeriesChartData
  };

  return (
    <CanvasJSChart
      options={multiSeriesChartOptions}
      onRef={ref => {
        setRef(ref);
        createRef(ref);
      }}
    />
  );
});
const TimeSeriesChart = React.memo(props => {
  const [data, setData] = useState(false);
  const [gotRef, setRef] = useState(false);
  const timeSeriesScatterChartOptions = {
    height: typeof window === "object" ? window.innerHeight : null,
    theme: "dark2",
    title: {
      text: "Scatter Chart"
    },
    axisX: {
      title: "Date",
      labelFormatter: function(e) {
        const { CanvasJS } = require("canvasjs-react-charts");

        return CanvasJS.formatDate(e.value, "DD MMM");
      }
    },
    axisY: {
      title: "Timing",
      suffix: "ms",
      includeZero: false,
      // logarithmic: true,
      // interval: 0.2,
      minimum: 500
    },
    legend: {
      cursor: "pointer",
      itemclick: e => {
        props.toggleDataSeries(e);
        console.log(gotRef);
        gotRef.render();
      }
    },

    data: data
  };

  useEffect(() => {
    const { query } = props;

    fetch(hostname + "api/get-timeseries?report=" + query.report)
      .then(res => res.json())
      .then(timeSeriesData => {
        const timeSeriesScatterData = generateTimeSeriesScatterChartData(
          timeSeriesData
        );

        setData(timeSeriesScatterData);
      });
  }, []);
  if (!data) {
    return null;
  }

  return (
    <CanvasJSChart
      options={timeSeriesScatterChartOptions}
      onRef={ref => {
        createRef(ref);
        setRef(ref);
      }}
    />
  );
});

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: ""
    };
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
  }

  toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
  }

  _handleSubmit = e => {
    e.preventDefault();
    if (this.state.inputValue === "") return alert("Task name is required");

    this.setState({ inputValue: "" });
    fetch("/api/add-url", {
      method: "POST",
      body: JSON.stringify([
        {
          name: this.state.inputValue,
          new: true,
          url: this.props.meta.url
        }
      ])
    });
  };

  onDelete = name => {
    this.setState({ inputValue: "" });
    fetch("/api/remove-url", {
      method: "POST",
      body: JSON.stringify([
        {
          name,
          url: this.props.meta.url
        }
      ])
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
            value={this.state.inputValue}
            onChange={e => this.setState({ inputValue: e.target.value })}
          />
        </div>
        <div>
          <WhiskerChart
            whiskerChartData={this.props.whiskerChartData}
            toggleDataSeries={this.toggleDataSeries}
          />
          <ScatterChart
            scatterChartData={this.props.scatterChartData}
            toggleDataSeries={this.toggleDataSeries}
          />
          <MultiSeriesChart
            multiSeriesChartData={this.props.multiSeriesChartData}
            toggleDataSeries={this.toggleDataSeries}
          />
          <TimeSeriesChart
            query={this.props.query}
            multiSeriesChartData={this.props.multiSeriesChartData}
            toggleDataSeries={this.toggleDataSeries}
          />
        </div>
      </>
    );
  }
}

Report.getInitialProps = async ({ query }) => {
  const { meta, ...report } = await fetch(
    hostname + "api/get-report?report=" + query.report
  ).then(res => res.json());
  // const timeSeriesData = await fetch(
  //   hostname + "api/get-timeseries?report=" + query.report
  // ).then((res) => res.json());
  //
  // const scatterData = generateTimeSeriesScatterChartData(timeSeriesData);
  return {
    scatterChartData: generateScatterChartData(report),
    whiskerChartData: generateWhiskerChartData(report),
    multiSeriesChartData: generateMultiSeriesChartData(report),
    meta,
    appKeys: Object.keys(report),
    // timeSeriesScatterData: scatterData,
    query
  };
};
export default Report;
