import { Graph } from "react-d3-graph";
import store from "../src/store";

const ModuleNodeGraph = ({ applications }) => {
  const nodes = [];
  const links = [];

  applications.forEach(({ id: appId, name, versions }) => {
    nodes.push({
      color: "darkgreen",
      id: appId,
      label: name,
      size: 800,
      symbolType: "wye",
    });
    versions[0].modules.forEach(({ id: moduleId, name: moduleName }) => {
      nodes.push({
        color: "darkblue",
        id: moduleId,
        label: moduleName,
        symbolType: "diamond",
      });
      links.push({
        source: appId,
        target: moduleId,
        color: "green",
        type: "CURVE_SMOOTH",
      });
    });
  });

  applications.forEach(({ id: appId, name: appName, versions }) => {
    versions[0].consumes
      .filter(({ application }) => application)
      .forEach(
        ({ application: { id: modApp }, name: modName, id: modId, usedIn }) => {
          links.push({
            source: appId,
            target: `${modApp}:${modName}`,
            type: "CURVE_SMOOTH",
          });
        }
      );
  });

  const data = {
    nodes,
    links,
  };

  const myConfig = {
    width: 1200,
    height: 800,
    nodeHighlightBehavior: true,
    node: {
      color: "lightgreen",
      size: 400,
      fontSize: 16,
      highlightStrokeColor: "blue",
      highlightFontSize: 20,
      highlightFontWeight: "bold",
    },
    d3: {
      alphaTarget: 0.5,
      gravity: -300,
      linkLength: 150,
      linkStrength: 0.5,
      disableLinkForce: false,
    },
    link: {
      highlightColor: "darkblue",
      semanticStrokeWidth: true,
      markerHeight: 8,
      markerWidth: 8,
    },
    directed: true,
    panAndZoom: true,
  };

  const onClickNode = (nodeId) => {
    store.selectedApplication = nodeId.replace(":", "/");
    store.detailDrawerOpen = true;
  };

  return (
    <div
      style={{
        marginTop: 50,
      }}
    >
      <Graph
        id="graph-id"
        data={data}
        config={myConfig}
        onClickNode={onClickNode}
      />
    </div>
  );
};

export default ModuleNodeGraph;
