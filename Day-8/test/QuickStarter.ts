import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("QuickStarter", function () {
  async function deployFixture() {
    const [deployer, projectOwner, investor1, investor2] =
      await hre.ethers.getSigners();

    const QuickStarter = await hre.ethers.getContractFactory("QuickStarter");
    const quickStarter = await QuickStarter.deploy();

    return { quickStarter, deployer, projectOwner, investor1, investor2 };
  }

  /* ------------------------------------------------ */
  /* ---------------- Deployment -------------------- */
  /* ------------------------------------------------ */

  it("Should set contract owner correctly", async function () {
    const { quickStarter, deployer } = await loadFixture(deployFixture);
    expect(await quickStarter.owner()).to.equal(deployer.address);
  });

  it("Should start with projectCount = 0", async function () {
    const { quickStarter } = await loadFixture(deployFixture);
    expect(await quickStarter.projectCount()).to.equal(0);
  });

  /* ------------------------------------------------ */
  /* --------------- Project Creation --------------- */
  /* ------------------------------------------------ */

  it("Should create a project successfully", async function () {
    const { quickStarter, projectOwner } = await loadFixture(deployFixture);

    await expect(
      quickStarter
        .connect(projectOwner)
        .createProject("My Project", hre.ethers.parseEther("5"))
    )
      .to.emit(quickStarter, "ProjectCreated")
      .withArgs(
        0,
        "My Project",
        projectOwner.address,
        hre.ethers.parseEther("5")
      );

    const project = await quickStarter.getProject(0);
    expect(project.name).to.equal("My Project");
    expect(project.owner).to.equal(projectOwner.address);
    expect(project.goalAmount).to.equal(hre.ethers.parseEther("5"));
    expect(project.isActive).to.equal(true);
  });

  it("Should increment projectCount after creation", async function () {
    const { quickStarter } = await loadFixture(deployFixture);

    await quickStarter.createProject(
      "Project A",
      hre.ethers.parseEther("1")
    );

    await quickStarter.createProject(
      "Project B",
      hre.ethers.parseEther("2")
    );

    expect(await quickStarter.projectCount()).to.equal(2);
  });

  it("Should fail if goalAmount is zero", async function () {
    const { quickStarter } = await loadFixture(deployFixture);

    await expect(
      quickStarter.createProject("Invalid", 0)
    ).to.be.revertedWith("Goal amount must be greater than zero");
  });

  /* ------------------------------------------------ */
  /* ----------------- Investments ------------------ */
  /* ------------------------------------------------ */

  it("Should allow users to invest ETH", async function () {
    const { quickStarter, projectOwner, investor1 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Crowd App", hre.ethers.parseEther("3"));

    await expect(
      quickStarter
        .connect(investor1)
        .invest(0, { value: hre.ethers.parseEther("1") })
    )
      .to.emit(quickStarter, "InvestmentMade")
      .withArgs(0, investor1.address, hre.ethers.parseEther("1"));

    const project = await quickStarter.getProject(0);
    expect(project.totalAmountRaised).to.equal(
      hre.ethers.parseEther("1")
    );
  });

  it("Should track individual investor contributions", async function () {
    const { quickStarter, projectOwner, investor1, investor2 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Web3 App", hre.ethers.parseEther("5"));

    await quickStarter
      .connect(investor1)
      .invest(0, { value: hre.ethers.parseEther("1") });

    await quickStarter
      .connect(investor2)
      .invest(0, { value: hre.ethers.parseEther("2") });

    const inv1 = await quickStarter.investments(0, investor1.address);
    const inv2 = await quickStarter.investments(0, investor2.address);

    expect(inv1).to.equal(hre.ethers.parseEther("1"));
    expect(inv2).to.equal(hre.ethers.parseEther("2"));
  });

  it("Should fail if investment amount is zero", async function () {
    const { quickStarter, projectOwner, investor1 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Zero Test", hre.ethers.parseEther("1"));

    await expect(
      quickStarter.connect(investor1).invest(0, { value: 0 })
    ).to.be.revertedWith("Investment amount must be greater than zero");
  });

  it("Should fail if project is inactive", async function () {
    const { quickStarter, deployer, projectOwner, investor1 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Inactive Test", hre.ethers.parseEther("1"));

    await quickStarter.connect(deployer).setProjectInactive(0);

    await expect(
      quickStarter
        .connect(investor1)
        .invest(0, { value: hre.ethers.parseEther("1") })
    ).to.be.revertedWith("Project is not active");
  });

  /* ------------------------------------------------ */
  /* ------------------ Withdrawal ------------------ */
  /* ------------------------------------------------ */

  it("Should allow project owner to withdraw funds", async function () {
    const { quickStarter, projectOwner, investor1 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Withdraw Test", hre.ethers.parseEther("2"));

    await quickStarter
      .connect(investor1)
      .invest(0, { value: hre.ethers.parseEther("1") });

    await expect(
      quickStarter.connect(projectOwner).withdraw(0)
    ).to.emit(quickStarter, "Withdrawal");

    const project = await quickStarter.getProject(0);
    expect(project.isActive).to.equal(false);
  });

  it("Should fail if non-owner tries to withdraw", async function () {
    const { quickStarter, projectOwner, investor1 } =
      await loadFixture(deployFixture);

    await quickStarter
      .connect(projectOwner)
      .createProject("Unauthorized Withdraw", hre.ethers.parseEther("1"));

    await expect(
      quickStarter.connect(investor1).withdraw(0)
    ).to.be.revertedWith("Only project owner can withdraw");
  });
});
