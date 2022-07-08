module.exports = (graph1, graph2) => {
  graph1.modules.push(...graph2.modules);
  // graphData.consumes.push(...hostData.consumes)
  graph1.overrides.push(...graph2.overrides);

  graph2.consumes.forEach((hostConsumedModule) => {
    const existing = graph1.consumes.find((sidecarConsumedModule) => {
      return (
        sidecarConsumedModule.consumingApplicationID ===
          hostConsumedModule.consumingApplicationID &&
        sidecarConsumedModule.applicationID ===
          hostConsumedModule.applicationID &&
        sidecarConsumedModule.name === hostConsumedModule.name
      );
    });

    if (existing) {
      hostConsumedModule.usedIn.forEach((consumedModule) => {
        const alreadyExists = existing.usedIn.find(({ file, url }) => {
          return consumedModule.file === file && consumedModule.url === url;
        });
        if (!alreadyExists) {
          existing.usedIn.push(consumedModule);
        }
      });
    } else {
      graph1.consumes.push(hostConsumedModule);
    }
  });

  return graph1;
};
