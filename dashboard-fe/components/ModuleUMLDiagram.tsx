import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  NodeModel,
  DagreEngine,
  DiagramEngine,
  PathFindingLinkFactory,
} from "@projectstorm/react-diagrams";
import * as React from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import styled from "@emotion/styled";

export interface CanvasContainerProps {}

namespace S {
  export const Container = styled.div`
    height: 1000px;
    display: flex;
    > * {
      height: 1000px;
      min-height: 100%;
      width: 100%;
    }
  `;
}

export class CanvasContainer extends React.Component<CanvasContainerProps> {
  render() {
    return <S.Container>{this.props.children}</S.Container>;
  }
}

class LayoutWidget extends React.Component<
  { model: DiagramModel; engine: DiagramEngine },
  any
> {
  engine: DagreEngine;

  constructor(props) {
    super(props);
    this.engine = new DagreEngine({
      graph: {
        rankdir: "RL",
        ranker: "network-simplex",
        marginx: 25,
        marginy: 25,
      },
      includeLinks: true,
    });
  }

  autoDistribute = () => {
    this.engine.redistribute(this.props.model);
    this.reroute();
    this.props.engine.repaintCanvas();
  };

  componentDidMount(): void {
    setTimeout(() => {
      this.autoDistribute();
      this.props.engine.zoomToFit();
    }, 0);
  }

  reroute() {
    this.props.engine
      .getLinkFactories()
      .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
      .calculateRoutingMatrix();
  }

  render() {
    return (
      <CanvasContainer>
        <CanvasWidget engine={this.props.engine} />
      </CanvasContainer>
    );
  }
}

const NODE_COLOR_SELECTED = "rgb(255,0,192)";
const NODE_COLOR_UNSELECTED = "rgba(0,192,255)";
const NODE_COLOR_DEFAULT = "rgb(0,192,255)";
const LINK_COLOR_DEFAULT = "gray";
const LINK_COLOR_SELECTED = "gray";
const LINK_COLOR_UNSELECTED = "rgba(0,192,255,0)";
const LINK_SIZE_DEFAULT = 3;

export default ({ applications }) => {
  let engine = createEngine();

  let model = new DiagramModel();

  let nodes: NodeModel[] = [];
  let links = [];

  const ports = {};

  applications.forEach(({ name, modules }) => {
    const node = new DefaultNodeModel(name, NODE_COLOR_DEFAULT);
    node.registerListener({
      eventDidFire: (evt) => {
        if (evt.function === "selectionChanged") {
          let selected = node.getOptions().selected;
          if (selected) {
            nodes.forEach((n) => {
              if (node === n) {
                n.getOptions().color =
                  node === n ? NODE_COLOR_SELECTED : NODE_COLOR_UNSELECTED;
              }
            });
            links.forEach((l) => {
              const sourceName = l.sourcePort.getOptions().name;
              const targetName = l.targetPort.getOptions().name;
              l.getOptions().color =
                sourceName === name || targetName.startsWith(name)
                  ? LINK_COLOR_SELECTED
                  : LINK_COLOR_UNSELECTED;
              l.getOptions().width =
                sourceName === name || targetName.startsWith(name) ? 3 : 0;
            });
          } else {
            nodes.forEach((n) => {
              n.getOptions().color = NODE_COLOR_DEFAULT;
            });
            links.forEach((l) => {
              l.getOptions().color = LINK_COLOR_DEFAULT;
              l.getOptions().width = LINK_SIZE_DEFAULT;
            });
          }
        }
      },
    });

    const port = new DefaultPortModel(true, name, "Application");
    ports[name] = port;
    node.addPort(port);

    modules.forEach(({ name: moduleName }) => {
      const id = `${name}:${moduleName}`;
      const port = new DefaultPortModel(true, id, moduleName);
      ports[id] = port;
      node.addPort(port);
    });
    nodes.push(node);
  });

  applications.forEach(({ name: fromApp, consumes }) => {
    consumes.forEach(({ application: { name: appName }, name: moduleName }) => {
      links.push(
        ports[fromApp].link(
          ports[`${appName}:${moduleName}`]
          // engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME)
        )
      );
    });
  });

  nodes.forEach((node, index) => {
    node.setPosition(index * 200, index * 200);
    model.addNode(node);
  });

  links.forEach((link) => {
    model.addLink(link);
  });

  engine.setModel(model);

  return <LayoutWidget model={model} engine={engine} />;
};
