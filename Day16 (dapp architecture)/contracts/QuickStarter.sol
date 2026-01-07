// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuickStarter {
    uint256 public projectCount;

    struct Project {
        string name;
        address owner;
        uint256 goalAmount;
        uint256 totalAmountRaised;
        bool isActive;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public investments;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        uint256 initialAmount
    );

    event Invested(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );

    event Withdrawn(
        uint256 indexed projectId,
        address indexed owner,
        uint256 amount
    );

    // 🔥 CREATE PROJECT WITH ETH (ESCROW)
    function createProject(
        string calldata name,
        uint256 goalAmount
    ) external payable {
        require(bytes(name).length > 0, "Name required");
        require(goalAmount > 0, "Invalid goal");
        require(msg.value > 0, "Initial ETH required");

        projects[projectCount] = Project({
            name: name,
            owner: msg.sender,
            goalAmount: goalAmount,
            totalAmountRaised: msg.value,
            isActive: true
        });

        investments[projectCount][msg.sender] = msg.value;

        emit ProjectCreated(projectCount, msg.sender, msg.value);
        projectCount++;
    }

    // 🔥 INVEST
    function invest(uint256 projectId) external payable {
        Project storage project = projects[projectId];

        require(project.isActive, "Project inactive");
        require(msg.value > 0, "ETH required");

        project.totalAmountRaised += msg.value;
        investments[projectId][msg.sender] += msg.value;

        emit Invested(projectId, msg.sender, msg.value);
    }

    // 🔥 WITHDRAW (OWNER ONLY)
    function withdraw(uint256 projectId) external {
        Project storage project = projects[projectId];

        require(msg.sender == project.owner, "Not owner");
        require(project.totalAmountRaised > 0, "No funds");

        uint256 amount = project.totalAmountRaised;
        project.totalAmountRaised = 0;
        project.isActive = false;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(projectId, msg.sender, amount);
    }

    function getProject(uint256 projectId)
        external
        view
        returns (Project memory)
    {
        return projects[projectId];
    }
}
