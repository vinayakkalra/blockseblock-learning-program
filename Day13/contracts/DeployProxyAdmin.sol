// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract DeployProxyAdmin {
    ProxyAdmin public admin;

    constructor() {
        admin = new ProxyAdmin(msg.sender);
    }
}
