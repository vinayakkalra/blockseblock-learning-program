// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// aave base sepolia pool address : 0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address user) external view returns (uint256);
}

interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;

    function repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external returns (uint256);
}

interface IPriceOracle {
    function getAssetPrice(address asset) external view returns (uint256);
}

contract AaveV3Integration {
    address public owner;
    IPool public immutable pool;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _pool) {
        require(_pool != address(0), "Invalid pool");
        owner = msg.sender;
        pool = IPool(_pool);
    }

    function supplyAsset(
        address asset,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "Amount zero");

        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        IERC20(asset).approve(address(pool), amount);

        pool.supply(
            asset,
            amount,
            address(this),
            0
        );
    }

    function borrowAsset(
        address asset,
        uint256 amount,
        uint256 interestRateMode
    ) external onlyOwner {
        require(amount > 0, "Amount zero");
        require(
            interestRateMode == 1 || interestRateMode == 2,
            "Invalid rate mode"
        );

        pool.borrow(
            asset,
            amount,
            interestRateMode,
            0,
            address(this)
        );
    }

    function repayLoan(
        address asset,
        uint256 amount,
        uint256 interestRateMode
    ) external onlyOwner {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        IERC20(asset).approve(address(pool), amount);

        pool.repay(
            asset,
            amount,
            interestRateMode,
            address(this)
        );
    }

    function withdrawAsset(
        address asset,
        uint256 amount
    ) external onlyOwner {
        pool.withdraw(
            asset,
            amount,
            msg.sender
        );
    }

    function getTokenBalance(address asset) external view returns (uint256) {
        return IERC20(asset).balanceOf(msg.sender);
    }
}
