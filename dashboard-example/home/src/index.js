// const injectScript = function (d, s, id, override) {
//   const promise = new Promise((resolve) => {
//     var js,
//       fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) {
//       return;
//     }
//     js = d.createElement(s);
//     js.id = id;
//     if (override && override.version) {
//       window[`remote_${override.name}`] = override.version;
//     }
//     js.onload = function () {
//       resolve();
//     };
//     const src =
//       override && override.version
//         ? "http://localhost:3002/" + override.version + ".remoteEntry.js"
//         : "http://localhost:3002/remoteEntry.js";
//     js.src = src;
//     fjs.parentNode.insertBefore(js, fjs);
//   });
//
//   return promise;
// };
import("./bootstrap");
const noRun = () =>
  fetch("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query {
    groups {
      name
      applications(id: "${process.CURRENT_HOST}") {
        name
        versions {
          version
        }
        overrides {
          name
          version
        }
      }
    }
  }`,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then(({ data }) => {
      const currentApp = data?.groups?.[0]?.applications?.[0];
      // TODO: address versioning the host
      if (!currentApp?.overrides?.length) {
        // console.log("no overrides, booting host");
        // injectScript(document, "script", "federation-dynamic-remote").then(() => {
        import("./bootstrap");
        // });
        return;
      }

      const allOverrides = currentApp.overrides.map((override) => {
        console.log(override);
        return injectScript(
          document,
          "script",
          "federation-override-" + override.name,
          override
        );
      });
      Promise.all(allOverrides).then(() => {
        import("./bootstrap");
      });
    });
