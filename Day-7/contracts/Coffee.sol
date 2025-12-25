// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/*
    Buy me a cup of coffee
    Different people will deposit 0.001 Ether which the owner can withdraw later
*/

contract Coffee {

    // Define state variables that will be used in the contract
    address public owner;
    uint256 public coffeePrice = 0.001 ether;
    mapping(address => uint256) public coffeesBought;

    // Deposit event
    event CoffeePurchased(address indexed buyer, uint256 quantity, uint256 amount);
    // Withdrawal event
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /*
        Function to buy a cup of coffee
        Function to withdraw a said amount
        Function to get contract balance
    */

    function buyCoffee(uint256 quantity) external payable {
        require(quantity > 0, "Quantity should be atleast 1");
        uint256 totalCost = coffeePrice * quantity;
        require(totalCost == msg.value, "The amount and quantity do not match");
        coffeesBought[msg.sender] += quantity;
        emit CoffeePurchased(msg.sender, quantity, totalCost);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No coffee has been bought");
        // payable(owner).transfer(balance);
        (bool success,) = owner.call{value: balance}("");
        require(success, "ETH Transfer has failed");
        emit FundsWithdrawn(owner, balance);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }


}