module.exports = {
  networks: {
    development: {
      port: 7545,
      network_id: "*",
      host: "127.0.0.1",
    },
  },
  compilers: {
    solc: {
      version: "0.7.3",
    },
  },
};
