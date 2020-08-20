import React from "react";
import dynamic from "next/dynamic";
import {
  generateScatterChartData,
  generateWhiskerChartData,
  generateMultiSeriesChartData,
  generateTimeSeriesScatterChartData,
} from "../../../lighthouse/utils";
import Form from "../../../components/FormVarient";
import { ListItem, List, IconButton } from "@material-ui/core";
import { Delete } from "@material-ui/icons";

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

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
    };
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
  }

  componentDidMount() {
    console.log("timeSeriesScatterData", this.props.timeSeriesScatterData);
  }

  toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
    this.chart2.render();
    this.chart3.render();
    this.chart4.render();
  }

  _handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.inputValue === "") return alert("Task name is required");

    this.setState({ inputValue: "" });
    fetch("/api/add-url", {
      method: "POST",
      body: JSON.stringify([
        {
          name: this.state.inputValue,
          new: true,
          url: this.props.meta.url,
        },
      ]),
    });
  };

  onDelete = (name) => {
    this.setState({ inputValue: "" });
    fetch("/api/remove-url", {
      method: "POST",
      body: JSON.stringify([
        {
          name,
          url: this.props.meta.url,
        },
      ]),
    });
  };

  render() {
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
        logarithmic: true,
        logarithmBase: 2,
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
      },

      data: this.props.whiskerChartData,
    };
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
        itemclick: this.toggleDataSeries,
      },

      data: this.props.scatterChartData,
    };

    const timeSeriesScatterChartOptions = {
      height: typeof window === "object" ? window.innerHeight : null,
      theme: "dark2",
      title: {
        text: "Scatter Chart",
      },
      axisX: {
        title: "Date",
        interval: 3,
        intervalType: "day",
      },
      axisY: {
        title: "Timing",
        suffix: "ms",
        includeZero: false,
        logarithmic: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
      },

      data: this.props.timeSeriesScatterData,
    };
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
        itemclick: this.toggleDataSeries,
      },
      toolTip: {
        shared: true,
        // content: toolTipFormatter
      },
      data: this.props.multiSeriesChartData,
    };
    return (
      <>
        <div>
          <Form
            appKeys={this.props.appKeys}
            onSubmit={this._handleSubmit}
            onDelete={this.onDelete}
            value={this.state.inputValue}
            onChange={(e) => this.setState({ inputValue: e.target.value })}
          />
        </div>
        <div>
          <CanvasJSChart
            options={whiskerChartOptions}
            onRef={(ref) => (this.chart = ref)}
          />
          <CanvasJSChart
            options={scatterChartOptions}
            onRef={(ref) => (this.chart2 = ref)}
          />
          <CanvasJSChart
            options={multiSeriesChartOptions}
            onRef={(ref) => (this.chart3 = ref)}
          />

          <CanvasJSChart
            options={timeSeriesScatterChartOptions}
            onRef={(ref) => (this.chart4 = ref)}
          />
        </div>
      </>
    );
  }
}

Report.getInitialProps = async ({ query }) => {
  const { meta, ...report } = await fetch(
    hostname + "api/get-report?report=" + query.report
  ).then((res) => res.json());
  const timeSeriesData = await fetch(
    hostname + "api/get-timeseries?report=" + query.report
  ).then((res) => res.json());

  const scatterData = generateTimeSeriesScatterChartData(timeSeriesData);
  return {
    scatterChartData: generateScatterChartData(report),
    whiskerChartData: generateWhiskerChartData(report),
    multiSeriesChartData: generateMultiSeriesChartData(report),
    meta,
    appKeys: Object.keys(report),
    timeSeriesScatterData: scatterData,
  };
};
export default Report;
