// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TransparentLogicV1 is Ownable {
    uint256 public value;

    constructor() Ownable(msg.sender) {}

    function setValue(uint256 _value) external {
        value = _value;
    }
}
