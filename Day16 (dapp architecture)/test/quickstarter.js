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

  it("should create a new project", async function () {
    await quickStarter
      .connect(user1)
      .createProject("Build DApp", ethers.parseEther("1"));

    const project = await quickStarter.getProject(0);

    expect(project.name).to.equal("Build DApp");
    expect(project.owner).to.equal(user1.address);
    expect(project.isActive).to.equal(true);
  });

  it("should allow users to invest in a project", async function () {
    await quickStarter
      .connect(user1)
      .createProject("Build DApp", ethers.parseEther("1"));

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("0.5") });

    const project = await quickStarter.getProject(0);
    expect(project.totalAmountRaised).to.equal(
      ethers.parseEther("0.5")
    );
  });

  it("should track individual investments", async function () {
    await quickStarter
      .connect(user1)
      .createProject("Build DApp", ethers.parseEther("1"));

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("0.3") });

    const investedAmount = await quickStarter.investments(0, user2.address);
    expect(investedAmount).to.equal(ethers.parseEther("0.3"));
  });

  it("should allow project owner to withdraw funds", async function () {
    await quickStarter
      .connect(user1)
      .createProject("Build DApp", ethers.parseEther("1"));

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("1") });

    await expect(
      quickStarter.connect(user1).withdraw(0)
    ).to.changeEtherBalance(user1, ethers.parseEther("1"));

    const project = await quickStarter.getProject(0);
    expect(project.isActive).to.equal(false);
  });

  it("should NOT allow non-owner to withdraw", async function () {
    await quickStarter
      .connect(user1)
      .createProject("Build DApp", ethers.parseEther("1"));

    await quickStarter
      .connect(user2)
      .invest(0, { value: ethers.parseEther("1") });

    await expect(
      quickStarter.connect(user2).withdraw(0)
    ).to.be.revertedWith("Only project owner can withdraw");
  });
});

