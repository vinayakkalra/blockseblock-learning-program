// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract DeployTransparentProxy {
    TransparentUpgradeableProxy public proxy;

    constructor(
        address logic,
        address admin,
        bytes memory data
    ) {
        proxy = new TransparentUpgradeableProxy(
            logic,
            admin,
            data
        );
    }
}
