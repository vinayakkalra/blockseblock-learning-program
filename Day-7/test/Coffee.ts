import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import CoffeeModule from "../ignition/modules/Coffee.js";

async function deployCoffeeFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    //   console.log(owner, otherAccount);
    const Coffee = await hre.ethers.getContractFactory("Coffee");
    const coffee = await Coffee.deploy();

    return { coffee,  owner, otherAccount };

}

describe("Deployment of Coffee contract", function () {
    it("Set correct owner", async function () {
        const { coffee, owner } = await loadFixture(deployCoffeeFixture);
        expect(await coffee.owner()).to.equal(owner.address);
    });

    it("should start with zero balance", async function () {
        const { coffee, owner } = await loadFixture(deployCoffeeFixture);
        const balance = await coffee.getContractBalance();
        expect(balance).to.equal(0);
    });
});

describe("Buying Coffee", function () {
    it("reject zero quantity", async function() {
        const { coffee, otherAccount } = await loadFixture(deployCoffeeFixture);
        const price = await coffee.coffeePrice();
        expect(coffee.connect(otherAccount).buyCoffee(0, {value: price})).to.be.revertedWith("Quantity should be atleast 1");
    });
});

describe("withdrawals", async function () {
    it("only owner can withdraw", async function () {
        const { coffee, otherAccount } = await loadFixture(deployCoffeeFixture);
        await expect(coffee.connect(otherAccount).withdraw()).to.be.revertedWith("Only owner can call this function");
    });
});