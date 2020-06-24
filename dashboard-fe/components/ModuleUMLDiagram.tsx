import React from "react";
import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  NodeModel,
  DagreEngine,
  DiagramEngine,
  PathFindingLinkFactory,
} from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import styled from "@emotion/styled";
import store from "../src/store";

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

class ModuleUMLDiagram extends React.PureComponent {
  constructor(props) {
    super(props);

    this.model = new DiagramModel();

    const nodes: NodeModel[] = [];
    const links = [];
    const ports = {};

    props.applications.forEach(({ name, modules }) => {
      const node = new DefaultNodeModel(name, NODE_COLOR_DEFAULT);

      node.registerListener({
        eventDidFire: (evt) => {
          if (evt.function === "selectionChanged") {
            const selected = node.getOptions().selected;
            if (selected) {
              store.selectedApplication = name;
              store.detailDrawerOpen = true;

              nodes.forEach((n) => {
                if (node === n) {
                  n.getOptions().color =
                    node === n ? NODE_COLOR_SELECTED : NODE_COLOR_UNSELECTED;
                }
              });

              links.forEach((l) => {
                const sourceName = l.sourcePort.getOptions().id;
                const targetName = l.targetPort.getOptions().id;
                l.getOptions().color =
                  sourceName === name || targetName.startsWith(name)
                    ? LINK_COLOR_SELECTED
                    : LINK_COLOR_UNSELECTED;
                l.getOptions().width =
                  sourceName === name || targetName.startsWith(name) ? 3 : 0;
              });
            } else {
              store.selectedApplication = null;
              store.detailDrawerOpen = false;

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

      ports[name] = node.addOutPort(name);
      ports[name].getOptions().id = name;

      modules.forEach(({ name: moduleName }) => {
        const id = `${name}:${moduleName}`;
        ports[id] = node.addInPort(moduleName);
        ports[id].getOptions().id = id;
      });
      nodes.push(node);
    });

    props.applications.forEach(({ name: fromApp, consumes }) => {
      consumes
        .filter(({ application }) => application)
        .forEach(({ application: { name: appName }, name: moduleName }) => {
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
      this.model.addNode(node);
    });

    links.forEach((link) => {
      this.model.addLink(link);
    });

    this.model.setLocked(true);
    this.engine = createEngine();
    this.engine.setModel(this.model);
  }

  render() {
    return <LayoutWidget model={this.model} engine={this.engine} />;
  }
}

export default ModuleUMLDiagram;
