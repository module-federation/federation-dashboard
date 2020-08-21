import React,{useRef,createRef,useEffect,useState} from "react";
import dynamic from "next/dynamic";
import {
  generateScatterChartData,
  generateWhiskerChartData,
  generateMultiSeriesChartData,
  generateTimeSeriesScatterChartData,
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

const WhiskerChart = React.memo((props) => {
  const [ready,setReady] = useState(false)
  useEffect(()=>{
    setReady(true)
  },[])
  if(!ready) {
    return null
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
      logarithmic: true,
      logarithmBase: 2,
    },
    legend: {
      cursor: "pointer",
      itemclick: props.toggleDataSeries,
    },

    data: props.whiskerChartData,
  };
  return (
      <CanvasJSChart
          options={whiskerChartOptions}
          onRef={createRef}
      />
  )
})
const ScatterChart = React.memo((props)=>{
  const [ready,setReady] = useState(false)
  useEffect(()=>{
    setReady(true)
  },[])
  if(!ready) {
    return null
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
      itemclick: props.toggleDataSeries,
    },

    data: props.scatterChartData,
  };
  return (
      <CanvasJSChart
          options={scatterChartOptions}
          onRef={createRef}
      />
  )
})
const MultiSeriesChart = React.memo((props)=>{
  const [ready,setReady] = useState(false)
  useEffect(()=>{
    setReady(true)
  },[])
  if(!ready) {
    return null
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
      itemclick: props.toggleDataSeries,
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
          onRef={createRef}
      />
  )
})
const TimeSeriesChart = React.memo((props)=>{
  const [data,setData] = useState(false)
  useEffect(()=>{
      const { query } = props;
   const {CanvasJS }= require("canvasjs-react-charts");
      fetch(
          hostname + "api/get-timeseries?report=" + query.report
      ).then((res) => res.json()).then((timeSeriesData)=>{
        const timeSeriesScatterData = generateTimeSeriesScatterChartData(timeSeriesData);

        const timeSeriesScatterChartOptions = {
          height: typeof window === "object" ? window.innerHeight : null,
          theme: "dark2",
          title: {
            text: "Scatter Chart",
          },
          axisX: {
            title: "Date",
            labelFormatter: function (e) {
                return CanvasJS.formatDate(e.value, "DD MMM")
            },
          },
          axisY: {
            title: "Timing",
            suffix: "ms",
            includeZero: false,
            logarithmic: true,
            interval: 0.2,
          },
          legend: {
            cursor: "pointer",
            itemclick: props.toggleDataSeries,
          },

          data: timeSeriesScatterData,
        };

        setData(timeSeriesScatterChartOptions)
      })
  },[])
  if(!data) {
    return null
  }


  return (
      <CanvasJSChart
          options={data}
          onRef={createRef}
      />
  )
})

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
    };
    this.toggleDataSeries = this.toggleDataSeries.bind(this);
  }

  toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
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
         <WhiskerChart whiskerChartData={this.props.whiskerChartData} toggleDataSeries={this.toggleDataSeries}/>
         <ScatterChart scatterChartData={this.props.scatterChartData} toggleDataSeries={this.toggleDataSeries}/>
         <MultiSeriesChart multiSeriesChartData={this.props.multiSeriesChartData} toggleDataSeries={this.toggleDataSeries}/>
         <TimeSeriesChart query={this.props.query} multiSeriesChartData={this.props.multiSeriesChartData} toggleDataSeries={this.toggleDataSeries}/>
        </div>
      </>
    );
  }
}

Report.getInitialProps = async ({ query }) => {
  const { meta, ...report } = await fetch(
    hostname + "api/get-report?report=" + query.report
  ).then((res) => res.json());
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
    query,
  };
};
export default Report;
