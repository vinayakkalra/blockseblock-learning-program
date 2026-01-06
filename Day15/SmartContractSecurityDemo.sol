// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    SMART CONTRACT SECURITY – ALL IN ONE

    This contract contains:
    ❌ Vulnerable functions (for teaching attacks)
    ✅ Secure versions (best practices)

    DO NOT DEPLOY THIS TO MAINNET.
    This is for EDUCATION only.
*/

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SmartContractSecurityDemo is ReentrancyGuard {

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(address => uint256) public balances;

    // For MEV commit–reveal
    mapping(address => bytes32) public withdrawCommitments;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                        BASIC DEPOSIT
    //////////////////////////////////////////////////////////////*/

    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
    }

    /*//////////////////////////////////////////////////////////////
                    1. REENTRANCY ATTACK
    //////////////////////////////////////////////////////////////*/

    /*
        ❌ VULNERABLE FUNCTION
        Problem:
        - External call before state update
        - Attacker can re-enter withdraw multiple times

        This is exactly how the DAO hack happened.
    */
    function withdrawVulnerable(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient");

        // ❌ Interaction before Effects
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH failed");

        balances[msg.sender] -= amount;
    }

    /*
        ✅ FIXED FUNCTION
        Solution:
        - Checks → Effects → Interactions
        - nonReentrant modifier blocks re-entry
    */
    function withdrawSafe(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient");

        // ✅ Effects first
        balances[msg.sender] -= amount;

        // ✅ Interaction last
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH failed");
    }

    /*//////////////////////////////////////////////////////////////
                2. MEV / FRONT-RUNNING ATTACK
    //////////////////////////////////////////////////////////////*/

    /*
        ❌ VULNERABLE FUNCTION
        Problem:
        - Amount is visible in mempool
        - Bot can copy tx and front-run with higher gas
    */
    function withdrawInstant(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Low balance");

        balances[msg.sender] -= amount;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH failed");
    }

    /*
        ✅ MEV PROTECTION – COMMIT PHASE
        Solution:
        - User hides withdraw data using hash
        - Bots can’t predict actual values
    */
    function commitWithdraw(bytes32 commitment) external {
        withdrawCommitments[msg.sender] = commitment;
    }

    /*
        ✅ MEV PROTECTION – REVEAL PHASE
        Solution:
        - Hash is verified on-chain
        - Front-running becomes useless
    */
    function revealWithdraw(
        uint256 amount,
        uint256 nonce
    ) external nonReentrant {
        bytes32 hash = keccak256(abi.encodePacked(amount, nonce));
        require(withdrawCommitments[msg.sender] == hash, "Invalid reveal");
        require(balances[msg.sender] >= amount, "Low balance");

        withdrawCommitments[msg.sender] = bytes32(0);
        balances[msg.sender] -= amount;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH failed");
    }

    /*//////////////////////////////////////////////////////////////
                    3. GAS OPTIMIZATION ATTACK
    //////////////////////////////////////////////////////////////*/

    /*
        ❌ VULNERABLE FUNCTION
        Problem:
        - Unbounded loop
        - Attacker can cause out-of-gas
        - Contract becomes unusable (DoS)
    */
    /*
    function gasGriefing(address[] memory users) external {
        for (uint256 i = 0; i < users.length; i++) {
            balances[users[i]] += 1;
        }
    }
    */

    /*
        ✅ FIXED APPROACH
        Solution:
        - No loops over dynamic arrays
        - User updates their own data (pull pattern)
    */
    function safeBalanceUpdate(uint256 amount) external {
        balances[msg.sender] += amount;
    }

    /*//////////////////////////////////////////////////////////////
                4. INTEGER OVERFLOW / UNDERFLOW
    //////////////////////////////////////////////////////////////*/

    /*
        ❌ OLD SOLIDITY ISSUE (<0.8)
        Problem:
        - Arithmetic overflow wraps silently
        - Leads to unlimited mint / balance bugs

        Solidity 0.8+ FIXES THIS BY DEFAULT
    */

    /*
        ✅ SAFE BY DEFAULT
        Solution:
        - Solidity 0.8+ reverts automatically
        - No SafeMath needed
    */
    function safeMathExample(uint256 amount) external {
        balances[msg.sender] += amount; // auto-checked
    }

    /*//////////////////////////////////////////////////////////////
                5. ACCESS CONTROL VULNERABILITY
    //////////////////////////////////////////////////////////////*/

    /*
        ❌ VULNERABLE FUNCTION
        Problem:
        - No access control
        - Anyone can drain contract
    */
    function emergencyWithdrawVulnerable() external {
        payable(msg.sender).transfer(address(this).balance);
    }


    /*
        ✅ FIXED FUNCTION
        Solution:
        - Only owner can perform admin actions
    */
    function emergencyWithdrawSafe() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
    /*//////////////////////////////////////////////////////////////
                        VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    receive() external payable {}
}
