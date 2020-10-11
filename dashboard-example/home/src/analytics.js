let sendAnalyticsMessage = null;

import("utils/analytics").then(mod => {
  sendAnalyticsMessage = mod.sendAnalyticsMessage;
});

export const sendMessage = msg => {
  sendAnalyticsMessage(msg);
};
