import { program } from "commander";

program.option("-i, --interactive", "manage the upload interactively");

program.parse(process.argv);

if (program.interactive) {
  process.stdin.setRawMode(true);
}

export const interactiveHold = async (message) =>
  new Promise((resolve) => {
    console.log(message);
    if (program.interactive) {
      process.stdin.setRawMode(true);
      process.stdin.once("data", () => {
        process.stdin.setRawMode(false);
        resolve();
      });
    } else {
      resolve();
    }
  });
