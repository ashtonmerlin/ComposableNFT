import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
import { node_url, accounts } from './utils/network'

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      polygon: 1
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    polygonTestnet: {
      url: node_url('polygonTestnet'),
      accounts: accounts()
    },
    polygon: {
      url: node_url('polygon'),
      accounts: accounts()
    }
  }
};

export default config;
