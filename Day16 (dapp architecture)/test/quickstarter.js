import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("QuickStarter (Crowdfunding)", function () {
  let quickStarter;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const QuickStarter = await ethers.getContractFactory("QuickStarter");
    quickStarter = await QuickStarter.deploy();
    await quickStarter.waitForDeployment();
  });

  it("should create a new project with initial ETH", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.2") }
      );

    const project = await quickStarter.getProject(0);

    expect(project.name).to.equal("Build DApp");
    expect(project.owner).to.equal(user1.address);
    expect(project.goalAmount).to.equal(ethers.parseEther("1"));
    expect(project.totalAmountRaised).to.equal(ethers.parseEther("0.2"));
    expect(project.isActive).to.equal(true);
  });

  it("should allow users to invest in a project", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.5") }
      );

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("0.5") });

    const project = await quickStarter.getProject(0);

    expect(project.totalAmountRaised).to.equal(
      ethers.parseEther("1.0")
    );
  });

  it("should track individual investments correctly", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.3") }
      );

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("0.4") });

    const invested = await quickStarter.investments(0, user2.address);
    expect(invested).to.equal(ethers.parseEther("0.4"));
  });

  it("should allow project owner to withdraw all raised funds", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.5") }
      );

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("0.5") });

    const totalRaised = ethers.parseEther("1");

    await expect(
      quickStarter.connect(user1).withdraw(0)
    ).to.changeEtherBalance(user1, totalRaised);

    const project = await quickStarter.getProject(0);
    expect(project.totalAmountRaised).to.equal(0);
    expect(project.isActive).to.equal(false);
  });

  it("should NOT allow non-owner to withdraw funds", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("0.2") }
      );

    await expect(
      quickStarter.connect(user2).withdraw(0)
    ).to.be.revertedWith("Not owner");
  });

  it("should NOT allow project creation without initial ETH", async function () {
    await expect(
      quickStarter
        .connect(user1)
        .createProject("Build DApp", ethers.parseEther("1"))
    ).to.be.revertedWith("Initial ETH required");
  });

  it("should NOT allow investing in inactive project", async function () {
    await quickStarter
      .connect(user1)
      .createProject(
        "Build DApp",
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );

    await quickStarter.connect(user1).withdraw(0);

    await expect(
      quickStarter
        .connect(user2)
        .invest(0, { value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("Project inactive");
  });
});
