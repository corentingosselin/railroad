import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      gasPrice: 1,
      blockGasLimit: 10000000 
    }
  },
};

export default config;
