import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  NodeModel,
  DagreEngine,
  DiagramEngine,
  PathFindingLinkFactory,
  DefaultNodeFactory,
  DefaultPortLabel,
} from "@projectstorm/react-diagrams";
import { Button } from "@material-ui/core";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import React from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '../s... Remove this comment to see the full error message
import store from "../src/store";

namespace S {
  export const Node = styled.div<{ background: string; selected: boolean }>`
    background-color: ${(p) => p.background};
    border-radius: 5px;
    font-family: sans-serif;
    color: white;
    border: solid 2px black;
    overflow: visible;
    font-size: 14px;
    border: solid 2px ${(p) => (p.selected ? "rgb(0,192,255)" : "black")};
  `;

  export const Title = styled.div`
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    white-space: nowrap;
    justify-items: center;
  `;

  export const TitleName = styled.div`
    flex-grow: 1;
    padding: 5px 5px;
    font-size: 15pt;
    font-weight: bold;
    text-align: center;
  `;

  export const InPortItem = styled.div`
    margin-top: 3px;
    margin-bottom: 3px;
  `;

  export const OutPortItem = styled.div`
    opacity: 0;
  `;

  export const Ports = styled.div`
    display: flex;
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
  `;

  export const PortsContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    &:first-of-type {
      margin-right: 10px;
    }
    &:only-child {
      margin-right: 0px;
    }
  `;
}

export interface DefaultNodeProps {
  node: DefaultNodeModel;
  engine: DiagramEngine;
}

export class NicerNodeWidget extends React.Component<DefaultNodeProps> {
  generateInPort = (port: any) => {
    return (
      <S.InPortItem key={port.getID()}>
        <DefaultPortLabel engine={this.props.engine} port={port} />
      </S.InPortItem>
    );
  };

  generateOutPort = (port: any) => {
    return (
      <S.OutPortItem key={port.getID()}>
        <DefaultPortLabel engine={this.props.engine} port={port} />
      </S.OutPortItem>
    );
  };

  render() {
    return (
      <S.Node
        data-default-node-name={this.props.node.getOptions().name}
        selected={this.props.node.isSelected()}
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message
        background={this.props.node.getOptions().color}
      >
        <S.Title>
          <S.TitleName>{this.props.node.getOptions().name}</S.TitleName>
        </S.Title>
        <S.Ports>
          <S.PortsContainer>
            {this.props.node.getInPorts().map(this.generateInPort)}
          </S.PortsContainer>
          <S.PortsContainer>
            {this.props.node.getOutPorts().map(this.generateOutPort)}
          </S.PortsContainer>
        </S.Ports>
      </S.Node>
    );
  }
}

export class NicerNodeFactory extends DefaultNodeFactory {
  generateReactWidget(event: any): JSX.Element {
    return <NicerNodeWidget engine={this.engine} node={event.model} />;
  }
}

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
  isDiagramMounted: any;
  constructor(props: { model: DiagramModel; engine: DiagramEngine }) {
    super(props);
  }

  autoDistribute() {
    const engine: DagreEngine = new DagreEngine({
      graph: {
        rankdir: "RL",
        ranker: "network-simplex",
        marginx: 25,
        marginy: 25,
      },
      includeLinks: true,
    });
    engine.redistribute(this.props.model);
    this.reroute();
    this.props.engine.repaintCanvas();
    this.forceUpdate();
  }

  componentDidMount(): void {
    this.isDiagramMounted = true;
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
      <div>
        <Button onClick={() => this.autoDistribute()}>Layout</Button>
        <CanvasContainer>
          <CanvasWidget engine={this.props.engine} />
        </CanvasContainer>
      </div>
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

const ModuleUMLDiagram = observer(({ applications }: any) => {
  const diagramRef = React.useRef(null);

  React.useEffect(() => {
    console.log("Changing state");
    if (diagramRef) {
      window.setTimeout(() => {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        diagramRef.current.autoDistribute();
      }, 0);
    }
  }, [store.versionType, store.group]);

  const engine = createEngine();
  engine.getNodeFactories().registerFactory(new NicerNodeFactory());

  const model = new DiagramModel();

  const nodes: NodeModel[] = [];
  const links: any = [];
  const ports = {};

  applications.forEach(({ name, versions }: any) => {
    const { modules } = versions[0];
    const node = new DefaultNodeModel(name, NODE_COLOR_DEFAULT);

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ eventDidFire: (evt: BaseEvent ... Remove this comment to see the full error message
    node.registerListener({
      eventDidFire: (evt) => {
        if (evt.function === "selectionChanged") {
          const selected = node.getOptions().selected;
          if (selected) {
            store.selectedApplication = name;
            store.detailDrawerOpen = true;

            nodes.forEach((n) => {
              if (node === n) {
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'color' does not exist on type 'BasePosit... Remove this comment to see the full error message
                n.getOptions().color =
                  node === n ? NODE_COLOR_SELECTED : NODE_COLOR_UNSELECTED;
              }
            });

            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'l' implicitly has an 'any' type.
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
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'color' does not exist on type 'BasePosit... Remove this comment to see the full error message
              n.getOptions().color = NODE_COLOR_DEFAULT;
            });
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'l' implicitly has an 'any' type.
            links.forEach((l) => {
              l.getOptions().color = LINK_COLOR_DEFAULT;
              l.getOptions().width = LINK_SIZE_DEFAULT;
            });
          }
        }
      },
    });

    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    ports[name] = node.addOutPort("");
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    ports[name].getOptions().id = name;

    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'moduleName' implicitly has an 'an... Remove this comment to see the full error message
    modules.forEach(({ name: moduleName }) => {
      const id = `${name}:${moduleName}`;
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ports[id] = node.addInPort(moduleName);
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ports[id].getOptions().id = id;
    });
    nodes.push(node);
  });

  applications.forEach(({ name: fromApp, versions }: any) => {
    versions[0].consumes
      .filter(({ application }: any) => application)
      // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'appName' implicitly has an 'any' ... Remove this comment to see the full error message
      .forEach(({ application: { name: appName }, name: moduleName }) => {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (ports[fromApp]) {
          let link = null;
          try {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            link = ports[fromApp].link(
              // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              ports[`${appName}:${moduleName}`]
              // engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME)
            );
          } catch (e) {}
          if (link) {
            links.push(link);
          }
        }
      });
  });

  nodes.forEach((node, index) => {
    node.setPosition(index * 200, index * 200);
    model.addNode(node);
  });

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'link' implicitly has an 'any' type.
  links.forEach((link) => {
    model.addLink(link);
  });

  engine.setModel(model);
  model.setLocked(true);

  return <LayoutWidget model={model} engine={engine} ref={diagramRef} />;
});

export default ModuleUMLDiagram;
