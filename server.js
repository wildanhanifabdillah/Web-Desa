import { spawn } from "child_process";

const apps = [
  ["npm", ["run", "start:web"]],
  ["npm", ["run", "mqtt:collector"]]
].map(([cmd, args]) =>
  spawn(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: true
  })
);

const stop = () => {
  apps.forEach((app) => app.kill("SIGTERM"));
  process.exit();
};

process.on("SIGTERM", stop);
process.on("SIGINT", stop);