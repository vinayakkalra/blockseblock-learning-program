// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const QuickStarterModule = buildModule("QuickStarterModule", (m) => {
  
  const quickStarter = m.contract("QuickStarter");

  return { quickStarter };
});

export default QuickStarterModule;
