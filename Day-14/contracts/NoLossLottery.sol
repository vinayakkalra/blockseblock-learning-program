// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IWrappedTokenGatewayV3.sol";
import "./interfaces/IPoolDataProvider.sol";
import "./interfaces/IAToken.sol";

contract NoLossLottery is ReentrancyGuard, VRFConsumerBaseV2Plus {
    IWrappedTokenGatewayV3 immutable wrappedTokenGateway;
    IAToken public immutable aToken;
    IERC20 public immutable wethToken;
    IPoolDataProvider public immutable protocolDataProvider;
    address public admin;

    mapping(address => uint256) public deposits;
    address[] public players;

    // Chainlink VRF variables
    address public immutable vrfCoordinator;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint256 public lastRequestId;
    bool public lotteryActive;
    uint256 public yieldToDistribute;

    // Add event declarations
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event LotteryWinner(address indexed winner, uint256 prize);
    event RandomnessRequested(uint256 requestId);

    constructor(
        address aaveGatewayAddress,
        address wethAtokenAddress,
        address vrfCoordinatorAddress,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        address aaveProtocolDataProviderAddress,
        address wethAssetAddress
    ) VRFConsumerBaseV2Plus(vrfCoordinatorAddress) {
        admin = msg.sender;
        wrappedTokenGateway = IWrappedTokenGatewayV3(aaveGatewayAddress);
        aToken = IAToken(wethAtokenAddress);
        vrfCoordinator = vrfCoordinatorAddress;
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        protocolDataProvider = IPoolDataProvider(aaveProtocolDataProviderAddress);
        wethToken = IERC20(wethAssetAddress);
    }

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        if (deposits[msg.sender] == 0) {
            players.push(msg.sender);
        }
        deposits[msg.sender] += msg.value;
        wrappedTokenGateway.depositETH{value: msg.value}(
            address(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951),
            address(this),
            0
        );
        emit Deposited(msg.sender, msg.value);
        
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        require(aToken.balanceOf(address(this)) >= amount, "Contract lacks sufficient aTokens");

        deposits[msg.sender] -= amount;

        aToken.approve(address(wrappedTokenGateway), amount);

        // Withdraw from Aave
        wrappedTokenGateway.withdrawETH(
            address(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951),
            amount,
            address(this)
        );

        // Transfer ETH to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getATokenBalance() external view returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function getScaledBalance() public view returns (uint256) {
        return aToken.scaledBalanceOf(address(this));
    }

    function getliquidityIndex() public view returns (uint256) {
        (, , , , , uint256 liquidityIndex, , , , , ,) = protocolDataProvider.getReserveData(address(wethToken));
        return liquidityIndex;
    }

    event GetValueNowAndTotalDeposits(uint256 value_now, uint256 totalDeposits, uint256 liquidityIndex, uint256 scaledBalance);

    // Request randomness from Chainlink VRF to pick a winner
    function pickWinner() external onlyOwner nonReentrant {
        require(players.length > 0, "No players in the lottery");
        require(!lotteryActive, "Lottery already in progress");

        // Calculate yield (interest earned)
        uint256 totalDeposits;
        for (uint256 i = 0; i < players.length; i++) {
            totalDeposits += deposits[players[i]];
        }

        uint256 liquidityIndex = getliquidityIndex();

        uint256 scaledBalance = getScaledBalance();

        uint256 value_now = (scaledBalance * liquidityIndex)/ (10**27);

        emit GetValueNowAndTotalDeposits(value_now, totalDeposits, liquidityIndex, scaledBalance);

        require(value_now > totalDeposits, "No yield to distribute");
        yieldToDistribute = value_now - totalDeposits;

        lotteryActive = true;
        lastRequestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                )
            })
        );
        emit RandomnessRequested(lastRequestId);
    }

    // Chainlink VRF callback
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        require(lotteryActive, "No lottery in progress");
        uint256 winnerIndex = randomWords[0] % players.length;
        address winner = players[winnerIndex];

        // Withdraw yield from Aave and send to winner
        wrappedTokenGateway.withdrawETH(
            address(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951),
            yieldToDistribute,
            address(this)
        );
        (bool success, ) = payable(winner).call{value: yieldToDistribute}("");
        require(success, "Yield transfer failed");

        emit LotteryWinner(winner, yieldToDistribute);

        lotteryActive = false;
        yieldToDistribute = 0;
    }

    // Emergency withdraw by owner
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 contractBalance = aToken.balanceOf(address(this));
        require(contractBalance > 0, "No funds to withdraw");
        wrappedTokenGateway.withdrawETH(
            address(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951),
            contractBalance,
            admin
        );
    }

    function getWrappedTokenGateway() external view returns (address) {
        return address(wrappedTokenGateway);
    }

    // Allow contract to receive ETH from Aave withdrawals
    receive() external payable {}
}
