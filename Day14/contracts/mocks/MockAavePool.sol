// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract MockAavePool {
    IERC20 public token;
    IERC20Mintable public aToken;

    constructor(address _token, address _aToken) {
        token = IERC20(_token);
        aToken = IERC20Mintable(_aToken);
    }

    function supply(
        address,
        uint256 amount,
        address onBehalfOf,
        uint16
    ) external {
        // pull underlying token
        token.transferFrom(msg.sender, address(this), amount);

        // ✅ mint aTokens (THIS WAS THE BUG)
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(
        address,
        uint256 amount,
        address to
    ) external returns (uint256) {
        // burn aTokens
        aToken.burn(msg.sender, amount);

        // return underlying token
        token.transfer(to, amount);

        return amount;
    }
}
