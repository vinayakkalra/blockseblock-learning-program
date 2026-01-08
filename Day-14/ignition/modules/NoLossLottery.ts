// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const wethGateway = "0x387d311e47e80b498169e6fb51d3193167d89F7D";
const aToken = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";

const NoLossLotteryModule = buildModule("NoLossLotteryModule", (m) => {
  const aaveGatewayAddress = m.getParameter("aaveGatewayAddress", wethGateway);
  const wethAtokenAddress = m.getParameter("wethAtokenAddress", aToken);
  const vrfCoordinatorAddress = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const _subscriptionId = 65475778234661754709737836321753098820861917333925931285158900332838660037311n;
  const _keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";

  const noLossLottery = m.contract("NoLossLottery", [aaveGatewayAddress, wethAtokenAddress, vrfCoordinatorAddress, _subscriptionId, _keyHash]);

  return { noLossLottery };
});

export default NoLossLotteryModule;
