let sendAnalyticsMessage = null;
const pending = [];

import("utils/analytics").then(mod => {
  sendAnalyticsMessage = mod.sendAnalyticsMessage;
  pending.forEach(sendAnalyticsMessage);
});

export const sendMessage = msg => {
  if (sendAnalyticsMessage) {
    sendAnalyticsMessage(msg);
  } else {
    pending.push(msg);
  }
};
