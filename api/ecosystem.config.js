module.exports = {
  apps: [
    {
      script: "src/index.js",
      name: "api",
      exec_mode: "cluster",
      instances: "max",
    },
  ],
};
