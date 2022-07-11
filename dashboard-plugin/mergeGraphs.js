module.exports = (graph1, graph2) => {
  //graph1.modules.push(/...graph2.modules);
  // graphData.consumes.push(...hostData.consumes)
  // graph1.overrides.push(...graph2.overrides);
console.log(graph1, graph2)
  //exposed
  graph2.modules.forEach((hostModules) => {

    // id: 'checkout:buy-button',
    //     name: 'buy-button',
    //     applicationID: 'checkout',
    //     requires: [],
    //     file: './components/buy-button/buy-button.tsx'

    const existing = graph1.modules.find((sidecarModules) => {
      return (
          hostModules.id === sidecarModules.id &&
          hostModules.name === sidecarModules.name &&
          hostModules.file === sidecarModules.file &&
          hostModules.applicationID === sidecarModules.applicationID
      );
    });
    if (existing) {
      existing.requires = Array.from(new Set([...existing.requires,...hostModules.requires]))
    } else {
      graph1.modules.push(hostModules);
    }
  });
  //shares
  graph2.overrides.forEach((hostOverrides) => {
    const existing = graph1.overrides.find((sidecarOverrides) => {
      return (
        sidecarOverrides.id === hostOverrides.id &&
        sidecarOverrides.name === hostOverrides.name &&
        sidecarOverrides.version === hostOverrides.version &&
        sidecarOverrides.location === hostOverrides.location &&
        sidecarOverrides.applicationID === hostOverrides.applicationID
      );
    });
    if(!existing) {
        graph1.overrides.push(hostOverrides);
    }
  });
  //consumes
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
