// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {ModifyPositionParams} from "@uniswap/v4-core/src/PoolManager.sol";



contract SimpleSwapHook is BaseHook {
    constructor(IPoolManager manager) BaseHook(manager) {}

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeModifyPosition: false,
            afterModifyPosition: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false
        });
    }

    /* ---------------- SWAP HOOKS ---------------- */

    function beforeSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata
    ) external pure override returns (bytes4) {
        // You can add checks here
        // slippage control, blacklist, custom fee logic, etc.
        return BaseHook.beforeSwap.selector;
    }

    function afterSwap(
        address,
        PoolKey calldata,
        IPoolManager.SwapParams calldata,
        BalanceDelta delta
    ) external pure override returns (bytes4) {
        // delta.amount0() and delta.amount1()
        // represents token in / out
        return BaseHook.afterSwap.selector;
    }
}
