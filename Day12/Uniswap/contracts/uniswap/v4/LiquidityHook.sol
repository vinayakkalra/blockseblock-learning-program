// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {ModifyPositionParams} from "@uniswap/v4-core/src/PoolManager.sol";


contract LiquidityHook is BaseHook {
    struct Position {
        uint128 liquidity;
    }

    // user => poolId => position
    mapping(address => mapping(bytes32 => Position)) public positions;

    constructor(IPoolManager _manager) BaseHook(_manager) {}

    /* ---------------- HOOK PERMISSIONS ---------------- */
    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,
            beforeModifyPosition: true,
            afterModifyPosition: true,
            beforeSwap: false,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false
        });
    }

    /* ---------------- POOL INIT ---------------- */

    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160,
        int24
    ) external override returns (bytes4) {
        bytes32 poolId = keccak256(abi.encode(key));
        return BaseHook.afterInitialize.selector;
    }

    /* ---------------- LIQUIDITY ---------------- */

    function beforeModifyPosition(
        address sender,
        PoolKey calldata key,
        ModifyPositionParams calldata params
    ) external override returns (bytes4) {
        bytes32 poolId = keccak256(abi.encode(key));

        if (params.liquidityDelta > 0) {
            positions[sender][poolId].liquidity += uint128(params.liquidityDelta);
        }

        if (params.liquidityDelta < 0) {
            positions[sender][poolId].liquidity -= uint128(-params.liquidityDelta);
        }

        return BaseHook.beforeModifyPosition.selector;
    }

    function afterModifyPosition(
        address,
        PoolKey calldata,
        ModifyPositionParams calldata,
        BalanceDelta
    ) external pure override returns (bytes4) {
        return BaseHook.afterModifyPosition.selector;
    }
}
