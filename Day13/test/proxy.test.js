import { expect } from "chai";
import hardhat from "hardhat";

const { ethers } = hardhat;

describe("Transparent Proxy", function () {
  let deployer, admin, user;
  let logicV1, proxyAddress, proxied;

  beforeEach(async () => {
    [deployer, admin, user] = await ethers.getSigners();

    // Deploy Logic V1
    const LogicV1 = await ethers.getContractFactory("TransparentLogicV1");
    logicV1 = await LogicV1.deploy();
    await logicV1.waitForDeployment();

    const logicV1Address = await logicV1.getAddress();

    // Deploy Proxy
    const ProxyDeployer = await ethers.getContractFactory(
      "DeployTransparentProxy"
    );

    const proxyDeployer = await ProxyDeployer.deploy(
      logicV1Address,
      admin.address,
      "0x"
    );

    await proxyDeployer.waitForDeployment();
    proxyAddress = await proxyDeployer.proxy();

    // Attach logic ABI to proxy
    proxied = LogicV1.attach(proxyAddress);
  });

  it("allows user to set value", async () => {
    await proxied.connect(user).setValue(10);
    expect(await proxied.value()).to.equal(10n);
  });

  it("allows admin EOA to call logic functions (ProxyAdmin is the actual proxy admin)", async () => {
    await proxied.connect(admin).setValue(5);
    expect(await proxied.value()).to.equal(5n);
  });

  it("allows admin (ProxyAdmin owner) to upgrade", async () => {
    const LogicV2 = await ethers.getContractFactory("TransparentLogicV2");
    const logicV2 = await LogicV2.deploy();
    await logicV2.waitForDeployment();
    const logicV2Address = await logicV2.getAddress();

    // Read the proxy admin slot (ERC-1967 admin slot)
    const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
    // Use JSON-RPC eth_getStorageAt via provider.send since `ethers.provider.getStorageAt` may not be available
    const proxyAdminSlot = await ethers.provider.send("eth_getStorageAt", [proxyAddress, ADMIN_SLOT, "latest"]);
    // Extract the last 40 hex characters (20 bytes address) from the 32-byte storage word
    const proxyAdminAddress = "0x" + proxyAdminSlot.slice(-40);

    const ProxyAdmin = await ethers.getContractAt("ProxyAdmin", proxyAdminAddress, admin);

    await ProxyAdmin.upgradeAndCall(proxyAddress, logicV2Address, "0x");

    const proxiedV2 = LogicV2.attach(proxyAddress);
    await proxiedV2.connect(user).setValue(20);

    expect(await proxiedV2.value()).to.equal(20n);
  });
});
