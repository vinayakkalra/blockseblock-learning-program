// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract QuickStarter {

    address public owner;
    uint256 public projectCount;

    // mapping to store projects
    mapping(uint256 => Project) public projects;

    // mapping to store project investments
    mapping(uint256 => mapping(address => uint256)) public investments;

    // Project structure
    struct Project {
        string name;
        address owner;
        uint256 goalAmount;
        uint256 totalAmountRaised;
        bool isActive;
    }

    event ProjectCreated(uint256 projectId, string name, address owner, uint256 goalAmount);

    event InvestmentMade(uint256 projectId, address investor, uint256 amount);

    event Withdrawal(uint256 projectId, address owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        projectCount = 0;
    }

    function createProject(string calldata name, uint256 goalAmount) external {
        require(goalAmount > 0, "Goal amount must be greater than zero");
        projects[projectCount] = Project({
            name: name,
            owner: msg.sender,
            goalAmount: goalAmount,
            totalAmountRaised: 0,
            isActive: true
        });
        projectCount++;

        emit ProjectCreated(projectCount - 1, name, msg.sender, goalAmount);
    }

    function invest(uint256 _projectId) external payable {
        Project storage currentProject = projects[_projectId];
        require(currentProject.isActive, "Project is not active");
        require(msg.value > 0, "Investment amount must be greater than zero");
        
        currentProject.totalAmountRaised += msg.value;

        investments[_projectId][msg.sender] += msg.value;

        emit InvestmentMade(_projectId, msg.sender, msg.value);

    }

    function withdraw (uint256 _projectId) external {
        Project storage currentProject = projects[_projectId];
        require(msg.sender == currentProject.owner, "Only project owner can withdraw");
        // require(currentProject.totalAmountRaised >= currentProject.goalAmount, "Funding goal not reached");
        require(currentProject.isActive, "Project is not active");
        currentProject.isActive = false;
        (bool success, ) = payable(currentProject.owner).call{value: currentProject.totalAmountRaised}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(_projectId, currentProject.owner, currentProject.totalAmountRaised);

    }

    function getProject(uint256 _projectId) external view returns (Project memory) {
        return projects[_projectId];
    }

    function setProjectInactive(uint256 _projectId) external onlyOwner {
        projects[_projectId].isActive = false;
    }

}