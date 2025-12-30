import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployQuickStarterFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner, project, investor1, investor2] = await hre.ethers.getSigners();

        const QuickStarter = await hre.ethers.getContractFactory("QuickStarter");
        const quickStarter = await QuickStarter.deploy();

        return { quickStarter, owner, project, investor1, investor2 };
    }

    describe("Deployment", function () {
        it("Should set owner correctly", async function () {
            const { quickStarter, owner } = await loadFixture(deployQuickStarterFixture);
            expect(await quickStarter.owner()).to.equal(owner.address);
        });
    });

    describe("Project Creation", function () {
        it("Should create a project successfully", async function () {
            const { quickStarter, project } = await loadFixture(deployQuickStarterFixture);
            await expect(quickStarter.connect(project).createProject("Test Project", hre.ethers.parseEther("10")))
                .to.emit(quickStarter, "ProjectCreated")
                .withArgs(0, "Test Project", project.address, hre.ethers.parseEther("10"));

            const createdProject = await quickStarter.getProject(0);
            expect(createdProject.name).to.equal("Test Project");
            expect(createdProject.goalAmount).to.equal(hre.ethers.parseEther("10"));
            expect(createdProject.owner).to.equal(project.address);
        });

        it("Should fail if project goal is zero", async function () {
            const { quickStarter } = await loadFixture(deployQuickStarterFixture);
            await expect(
                quickStarter.createProject("Invalid Project", 0)
            ).to.be.revertedWith("Goal amount must be greater than zero");
        });
    });

    describe("Investments", function () {
        it("Should allow investors to invest ETH", async function () {
            const { quickStarter, owner, investor1, investor2 } = await loadFixture(deployQuickStarterFixture);
            await quickStarter.createProject(
                "Blockchain App",
                hre.ethers.parseEther("5")
            );
            
            await expect(
                quickStarter
                    .connect(investor1)
                    .invest(1, { value: hre.ethers.parseEther("1") })
            )
                .to.emit(quickStarter, "InvestmentMade")
                .withArgs(1, investor1.address, hre.ethers.parseEther("1"));

            await expect(
                quickStarter
                    .connect(investor2)
                    .invest(1, { value: hre.ethers.parseEther("2") })
            )
                .to.emit(quickStarter, "InvestmentMade")
                .withArgs(1, investor2.address, hre.ethers.parseEther("2"));

            const project = await quickStarter.getProject(1);
            expect(project.totalAmountRaised).to.equal(hre.ethers.parseEther("3"));
        });


        it("Should track individual investor contributions", async function () {
            const { quickStarter, owner, investor1, investor2 } = await loadFixture(deployQuickStarterFixture);
            await quickStarter.createProject(
                "Web3 Platform",
                hre.ethers.parseEther("2")
            );

            await quickStarter
                .connect(investor1)
                .invest(1, { value: hre.ethers.parseEther("0.5") });

            await quickStarter
                .connect(investor2)
                .invest(1, { value: hre.ethers.parseEther("0.3") });

            const investment1 = await quickStarter.investments(
                1,
                investor1.address
            );

            const investment2 = await quickStarter.investments(
                1,
                investor2.address
            );

            expect(investment1).to.equal(hre.ethers.parseEther("0.5"));
            expect(investment2).to.equal(hre.ethers.parseEther("0.3"));
        });

        it("Should fail if investment amount is zero", async function () {
            const { quickStarter, owner, investor1, investor2 } = await loadFixture(deployQuickStarterFixture);
            await quickStarter.createProject(
                "Zero Invest Test",
                hre.ethers.parseEther("1")
            );

            await expect(
                quickStarter.connect(investor1).invest(1, { value: 0 })
            ).to.be.revertedWith("Investment must be > 0");
        });

        it("Should fail if project does not exist", async function () {
            const { quickStarter, owner, investor1, investor2 } = await loadFixture(deployQuickStarterFixture);
            await expect(
                quickStarter.connect(investor1).invest(99, {
                    value: hre.ethers.parseEther("0.1"),
                })
            ).to.be.reverted;
        });
    });
});