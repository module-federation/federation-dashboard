import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  NodeModel,
  DagreEngine,
  DiagramEngine,
  PathFindingLinkFactory,
  DefaultLinkModel,
  DefaultLinkWidget,
  PointModel,
  LinkWidget,
  DefaultLinkFactory,
} from "@projectstorm/react-diagrams";
import * as React from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import styled from "@emotion/styled";

export class AdvancedLinkModel extends DefaultLinkModel {
  constructor() {
    super({
      type: "advanced",
      width: 4,
    });
    this.showArrow = false;
  }
}

export class AdvancedPortModel extends DefaultPortModel {
  createLinkModel(): AdvancedLinkModel | null {
    return new AdvancedLinkModel();
  }
}

const CustomLinkArrowWidget = (props) => {
  const { point, previousPoint } = props;

  const angle =
    90 +
    (Math.atan2(
      point.getPosition().y - previousPoint.getPosition().y,
      point.getPosition().x - previousPoint.getPosition().x
    ) *
      180) /
      Math.PI;

  //translate(50, -10),
  return (
    <g
      className="arrow"
      transform={
        "translate(" +
        point.getPosition().x +
        ", " +
        point.getPosition().y +
        ")"
      }
    >
      <g style={{ transform: "rotate(" + angle + "deg)" }}>
        <g transform={"translate(0, -3)"}>
          <polygon
            points="0,10 8,30 -8,30"
            fill={props.color}
            onMouseLeave={() => {
              this.setState({ selected: false });
            }}
            onMouseEnter={() => {
              this.setState({ selected: true });
            }}
            data-id={point.getID()}
            data-linkid={point.getLink().getID()}
          ></polygon>
        </g>
      </g>
    </g>
  );
};

export class AdvancedLinkWidget extends DefaultLinkWidget {
  generateArrow(point: PointModel, previousPoint: PointModel): JSX.Element {
    return this.props.link.getOptions().showArrow ? (
      <CustomLinkArrowWidget
        key={point.getID()}
        point={point as any}
        previousPoint={previousPoint as any}
        colorSelected={this.props.link.getOptions().selectedColor}
        color={this.props.link.getOptions().color}
      />
    ) : null;
  }

  render() {
    //ensure id is present for all points on the path
    var points = this.props.link.getPoints();
    var paths = [];
    this.refPaths = [];

    //draw the multiple anchors and complex line instead
    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            "data-linkid": this.props.link.getID(),
            "data-point": j,
            onMouseDown: (event: MouseEvent) => {
              this.addPointToLink(event, j + 1);
            },
          },
          j
        )
      );
    }

    for (let i = 1; i < points.length - 1; i++) {
      paths.push(this.generatePoint(points[i]));
    }

    if (this.props.link.getTargetPort() !== null) {
      paths.push(
        this.generateArrow(points[points.length - 1], points[points.length - 2])
      );
    } else {
      paths.push(this.generatePoint(points[points.length - 1]));
    }

    return (
      <g data-default-link-test={this.props.link.getOptions().testName}>
        {paths}
      </g>
    );
  }
}

export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super("advanced");
  }

  generateModel(): AdvancedLinkModel {
    return new AdvancedLinkModel();
  }

  generateReactWidget(event): JSX.Element {
    return (
      <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />
    );
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
  engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());

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
              l.getOptions().showArrow = true;
            });
          } else {
            nodes.forEach((n) => {
              n.getOptions().color = NODE_COLOR_DEFAULT;
            });
            links.forEach((l) => {
              l.getOptions().showArrow = false;
              l.getOptions().color = LINK_COLOR_DEFAULT;
              l.getOptions().width = LINK_SIZE_DEFAULT;
            });
          }
        }
      },
    });

    const port = new AdvancedPortModel(true, name, "Application");
    ports[name] = port;
    node.addPort(port);

    modules.forEach(({ name: moduleName }) => {
      const id = `${name}:${moduleName}`;
      const port = new AdvancedPortModel(true, id, moduleName);
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
