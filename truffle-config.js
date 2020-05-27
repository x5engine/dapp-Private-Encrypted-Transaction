const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require("fs");
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    abs_x5engine_x5engine_x5engine: {
      network_id: "*",
      gas: 0,
      gasPrice: 0,
      provider: new HDWalletProvider(fs.readFileSync('c:\\Users\\user\\Documents\\SmallContract\\mnemonic.env', 'utf-8'), "https://x5engine.blockchain.azure.com:3200/E-FlUTqcGM65Si6SaBQwe6sg")
    }
  },
  compilers: {
    solc: {
      version: "0.5.16"
    }
  }
};
