import { ResponsiveChord } from "@nivo/chord";

const ModuleChordChart = ({ applications }) => {
  const modules = applications.map(({ modules }) => modules).flat();
  const columns = applications.length + modules.length;
  const matrix = new Array(columns)
    .fill(0)
    .map(() => new Array(columns).fill(0));
  const keys = [];
  const appById = {};
  const modulesById = {};
  applications.forEach(({ id, name: appName, modules }) => {
    appById[id] = keys.length;
    keys.push(appName);
    modules.forEach(({ name: moduleName }) => {
      modulesById[`${appName}/${moduleName}`] = keys.length;
      keys.push(`${appName}/${moduleName}`);
    });
  });
  applications.forEach(({ id, consumes }) => {
    consumes
      .filter(({ application }) => application)
      .forEach(({ application: { name: appName }, name, usedIn }) => {
        const modId = `${appName}/${name}`;
        matrix[appById[id]][modulesById[modId]] = usedIn.length;
        matrix[modulesById[modId]][appById[id]] = usedIn.length;
      });
  });

  return (
    <div
      style={{
        height: 1200,
        width: "100%",
        marginTop: 50,
      }}
    >
      <ResponsiveChord
        matrix={matrix}
        keys={keys}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        valueFormat=".2f"
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        arcOpacity={1}
        arcBorderWidth={1}
        arcBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        ribbonOpacity={0.5}
        ribbonBorderWidth={1}
        ribbonBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        enableLabel={true}
        label="id"
        labelOffset={12}
        labelRotation={-90}
        labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
        colors={{ scheme: "nivo" }}
        isInteractive={true}
        arcHoverOpacity={1}
        arcHoverOthersOpacity={0.25}
        ribbonHoverOpacity={0.75}
        ribbonHoverOthersOpacity={0.25}
        animate={true}
        motionStiffness={90}
        motionDamping={7}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 70,
            itemWidth: 80,
            itemHeight: 14,
            itemsSpacing: 0,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default ModuleChordChart;
