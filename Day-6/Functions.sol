// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SolidityBasics {
    /* ------------------------------------------------------------------
       STATE VARIABLES
    ------------------------------------------------------------------ */

    address public owner; // stores contract owner
    uint256 public totalBalance; // stores total ether received

    /* ------------------------------------------------------------------
       EVENTS
       Used to emit logs on blockchain
    ------------------------------------------------------------------ */

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    /* ------------------------------------------------------------------
       CUSTOM ERRORS (Gas efficient)
    ------------------------------------------------------------------ */

    error NotOwner();
    error InsufficientBalance(uint256 requested, uint256 available);

    /* ------------------------------------------------------------------
       CONSTRUCTOR
       Runs once when contract is deployed
    ------------------------------------------------------------------ */

    // Global variables: block, msg, tx
    // Examples:
    // block.timestamp - current block timestamp
    // block.number - current block number
    // msg.sender - address of the caller
    // msg.value - amount of ether sent with the call
    // tx.gasprice - gas price of the transaction

    constructor() {
        owner = msg.sender; // global variable
    }

    /* ------------------------------------------------------------------
       FUNCTION MODIFIER
       Used to restrict access
    ------------------------------------------------------------------ */

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function getOwner() public view onlyOwner returns (address, uint) {
        return (owner, block.number);
    }

    /* ------------------------------------------------------------------
        UNITS OF ETHER
        Demonstrates:
            - 10**18 wei 
            - 10**9 gwei
            - 1 ether 
    ------------------------------------------------------------------ */

    uint256 amountInWei = 500; // Assumed to be 500 wei
    uint256 amountInGwei = 10 gwei; // Equivalent to 10,000,000,000 wei
    uint256 amountInEther = 1 ether; // Equivalent to 1,000,000,000,000,000,000 wei

    /* ------------------------------------------------------------------
       PAYABLE FUNCTION
       Demonstrates:
        - payable functions    
        - events
    ------------------------------------------------------------------ */

    function deposit() public payable {
        // Expression: arithmetic operation
        totalBalance = totalBalance + msg.value;
        // Emit event
        emit Deposited(msg.sender, msg.value);
    }

    /* ------------------------------------------------------------------
       WITHDRAW FUNCTION
       Demonstrates:
       - require
       - revert
       - modifiers
       - transfer
    ------------------------------------------------------------------ */

    function withdraw(uint256 amount) public onlyOwner {
        // Control structure (if)
        if (amount > address(this).balance) {
            revert InsufficientBalance(amount, address(this).balance);
        }

        // Transfer ether (unit: wei)
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    /* ------------------------------------------------------------------
       VIEW FUNCTION
       Demonstrates:
       - Global variables
       - Function return
    ------------------------------------------------------------------ */

    
    
    function getContractInfo()
        public
        view
        returns (
            address contractOwner,
            uint256 contractBalance,
            uint256 currentBlock,
            uint256 currentTimestamp
        )
    {
        contractOwner = owner;
        contractBalance = address(this).balance;
        currentBlock = block.number; // global variable
        currentTimestamp = block.timestamp; // global variable
    }

    /* ------------------------------------------------------------------
       TIME UNITS EXAMPLE
    ------------------------------------------------------------------ */

    function getOneDayInSeconds() public pure returns (uint256) {
        return 1 days; // time unit
    }

    /* ------------------------------------------------------------------
       FALLBACK & RECEIVE
       Handle direct ether transfer
    ------------------------------------------------------------------ */

    receive() external payable {
        totalBalance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    fallback() external payable {
        revert("Invalid function call");
    }
}
