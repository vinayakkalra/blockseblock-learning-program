// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CoffeeModule = buildModule("CoffeeModule", (m) => {
  
  const coffee = m.contract("Coffee");

  return { coffee };
});

export default CoffeeModule;
