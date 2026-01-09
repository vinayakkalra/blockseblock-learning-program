// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IAToken {
    function POOL() external view returns (address);

    function getIncentivesController() external view returns (address);

    function UNDERLYING_ASSET_ADDRESS() external view returns (address);

    function RESERVE_TREASURY_ADDRESS() external view returns (address);

    /**
     * @notice Returns the scaled total supply of the scaled balance token. Represents sum(debt/index)
     * @return The scaled total supply
     */
    function scaledTotalSupply() external view returns (uint256);

    function scaledBalanceOf(address user) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address user) external view returns (uint256);
}
