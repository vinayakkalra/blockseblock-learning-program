// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*//////////////////////////////////////////////////////////////
                        OPENZEPPELIN
//////////////////////////////////////////////////////////////*/

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*//////////////////////////////////////////////////////////////
                        CHAINLINK VRF
//////////////////////////////////////////////////////////////*/

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";


/*//////////////////////////////////////////////////////////////
                        AAVE V3 POOL
//////////////////////////////////////////////////////////////*/

interface IAavePool {
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
}

/*//////////////////////////////////////////////////////////////
                    YIELD PRIZE POOL
//////////////////////////////////////////////////////////////*/

contract YieldPrizePool is
    Ownable,
    ReentrancyGuard,
    VRFConsumerBaseV2
{
    /*//////////////////////////////////////////////////////////////
                            STATE
    //////////////////////////////////////////////////////////////*/

    // Aave
    IAavePool public immutable aavePool;
    IERC20 public immutable depositToken;
    IERC20 public immutable aToken;

    // Pool
    uint256 public roundDuration = 7 days;
    uint256 public roundStartTime;
    uint256 public totalDeposits;

    address[] public players;
    mapping(address => uint256) public userDeposits;
    mapping(address => bool) private joined;

    address public lastWinner;

    // Chainlink VRF
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    bytes32 public immutable keyHash;
    uint64 public immutable subscriptionId;
    uint32 public callbackGasLimit = 300_000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    bool public randomnessRequested;

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event WinnerSelected(address indexed winner, uint256 reward);
    event NewRoundStarted(uint256 startTime);
    event RandomnessRequested(uint256 requestId);

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _aavePool,
        address _depositToken,
        address _aToken,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    )
        Ownable(msg.sender)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        aavePool = IAavePool(_aavePool);
        depositToken = IERC20(_depositToken);
        aToken = IERC20(_aToken);

        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;

        roundStartTime = block.timestamp;

        // Approve Aave Pool
        IERC20(_depositToken).approve(_aavePool, type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                        USER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount zero");
        require(block.timestamp < roundStartTime + roundDuration, "Round ended");

        if (!joined[msg.sender]) {
            joined[msg.sender] = true;
            players.push(msg.sender);
        }

        depositToken.transferFrom(msg.sender, address(this), amount);

        aavePool.supply(
            address(depositToken),
            amount,
            address(this),
            0
        );

        userDeposits[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw() external nonReentrant {
        uint256 deposited = userDeposits[msg.sender];
        require(deposited > 0, "No deposit");

        userDeposits[msg.sender] = 0;
        totalDeposits -= deposited;

        aavePool.withdraw(
            address(depositToken),
            deposited,
            msg.sender
        );

        emit Withdrawn(msg.sender, deposited);
    }

    /*//////////////////////////////////////////////////////////////
                    RANDOMNESS REQUEST
    //////////////////////////////////////////////////////////////*/

    function pickWinner() external nonReentrant onlyOwner {
        require(block.timestamp >= roundStartTime + roundDuration, "Round active");
        require(players.length > 0, "No players");
        require(!randomnessRequested, "Already requested");

        randomnessRequested = true;

        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );

        emit RandomnessRequested(requestId);
    }

    /*//////////////////////////////////////////////////////////////
                CHAINLINK VRF CALLBACK
    //////////////////////////////////////////////////////////////*/

    function fulfillRandomWords(
        uint256,
        uint256[] memory randomWords
    ) internal override nonReentrant {
        uint256 aTokenBalance = aToken.balanceOf(address(this));
        require(aTokenBalance > totalDeposits, "No yield");

        uint256 yieldAmount = aTokenBalance - totalDeposits;

        uint256 randomIndex = randomWords[0] % players.length;
        address winner = players[randomIndex];

        lastWinner = winner;

        aavePool.withdraw(
            address(depositToken),
            yieldAmount,
            winner
        );

        emit WinnerSelected(winner, yieldAmount);

        randomnessRequested = false;
        _startNewRound();
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _startNewRound() internal {
        for (uint256 i = 0; i < players.length; i++) {
            joined[players[i]] = false;
        }

        delete players;
        roundStartTime = block.timestamp;

        emit NewRoundStarted(block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getPlayersCount() external view returns (uint256) {
        return players.length;
    }

    function getCurrentYield() external view returns (uint256) {
        uint256 balance = aToken.balanceOf(address(this));
        if (balance <= totalDeposits) return 0;
        return balance - totalDeposits;
    }
}
