// test/Rematic.proxy.js
// Load dependencies
// const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

let TransferProxy;
let ERC20TransferProxy;
let ERC721LazyMintTransferProxy;
let ERC1155LazyMintTransferProxy;
let ERC721Rarible;
let ERC1155Rarible;
let ERC721RaribleFactoryC2;
let RoyaltiesRegistry;
let ExchangeV2;
let ERC721RaribleBeacon;
let ERC1155RaribleBeacon;
let ERC1155RaribleFactoryC2;
let transferProxy;
let erc20TransferProxy;
let lazyTransferProxy721;
let lazyTransferProxy1155;
let royaltiesRegistry;
let erc721rarible;
let erc1155rarible;
let exchangeV2;
let erc721raribleFactoryC2;
let erc721RaribleBeacon;
let erc1155RaribleBeacon;
let erc1155raribleFactoryC2;

// Start test block
describe("Rarible Redeployment", function () {
  //   beforeEach(async function () {});

  // Test case
  it("deployment works.", async function () {
    TransferProxy = await ethers.getContractFactory("TransferProxy");
    ERC20TransferProxy = await ethers.getContractFactory("ERC20TransferProxy");
    ERC721LazyMintTransferProxy = await ethers.getContractFactory("ERC721LazyMintTransferProxy");
    ERC1155LazyMintTransferProxy = await ethers.getContractFactory("ERC1155LazyMintTransferProxy");
    ERC721Rarible = await ethers.getContractFactory("ERC721Rarible");
    ERC1155Rarible = await ethers.getContractFactory("ERC1155Rarible");
    RoyaltiesRegistry = await ethers.getContractFactory("RoyaltiesRegistry");
    ExchangeV2 = await ethers.getContractFactory("ExchangeV2");
    ERC721RaribleFactoryC2 = await ethers.getContractFactory("ERC721RaribleFactoryC2");
    ERC721RaribleBeacon = await ethers.getContractFactory("ERC721RaribleBeacon");
    ERC1155RaribleBeacon = await ethers.getContractFactory("ERC1155RaribleBeacon");
    ERC1155RaribleFactoryC2 = await ethers.getContractFactory("ERC1155RaribleFactoryC2");

    transferProxy = await TransferProxy.deploy();
    await transferProxy.deployed();

    console.log(transferProxy.address, "NFT Transfer Proxy (for Approvals) deployed: \n");

    erc20TransferProxy = await ERC20TransferProxy.deploy();
    await erc20TransferProxy.deployed();

    console.log(erc20TransferProxy.address, "erc20TransferProxy contract deployed: \n");

    lazyTransferProxy721 = await ERC721LazyMintTransferProxy.deploy();
    await lazyTransferProxy721.deployed();

    console.log(lazyTransferProxy721.address, "lazyTransferProxy721 contract deployed: \n");

    lazyTransferProxy1155 = await ERC1155LazyMintTransferProxy.deploy();
    await lazyTransferProxy1155.deployed();

    console.log(lazyTransferProxy1155.address, "lazyTransferProxy1155 contract deployed: \n");


    royaltiesRegistry = await upgrades.deployProxy(RoyaltiesRegistry, [], {
      initializer: "__RoyaltiesRegistry_init",
    });
    await royaltiesRegistry.deployed();

    console.log(royaltiesRegistry.address, " royaltiesRegistry(proxy) address");
    console.log(
      await upgrades.erc1967.getImplementationAddress(royaltiesRegistry.address),
      " royaltiesRegistry implementation address"
    );
    console.log(await upgrades.erc1967.getAdminAddress(royaltiesRegistry.address), " royaltiesRegistry admin address\n");

    erc721rarible = await upgrades.deployProxy(
      ERC721Rarible,
      [
        "FreeMintableRarible",
        "RARI",
        "https://ipfs.rarible.com",
        "https://ipfs.rarible.com",
        transferProxy.address,
        lazyTransferProxy721.address,
      ],
      {
        initializer: "__ERC721Rarible_init",
      }
    );

    await erc721rarible.deployed();

    console.log(erc721rarible.address, " erc721rarible(proxy) address");
    console.log(
      await upgrades.erc1967.getImplementationAddress(erc721rarible.address),
      " erc721rarible implementation address"
    );
    console.log(await upgrades.erc1967.getAdminAddress(erc721rarible.address), " erc721rarible admin address\n");


    erc721RaribleBeacon = await ERC721RaribleBeacon.deploy(erc721rarible.address);
    await erc721RaribleBeacon.deployed();
  
    console.log(erc721RaribleBeacon.address, "ERC721Beacon contract deployed \n");


    erc721raribleFactoryC2 = await ERC721RaribleFactoryC2.deploy(erc721RaribleBeacon.address, transferProxy.address, lazyTransferProxy721.address);
    await erc721raribleFactoryC2.deployed();

    console.log(erc721raribleFactoryC2.address, "ERC-721 Token Factory contract deployed \n");


    erc1155rarible = await upgrades.deployProxy(
      ERC1155Rarible,
      ["FreeMintable", "TST", "ipfs:/", "ipfs:/", transferProxy.address, lazyTransferProxy1155.address],
      {
        initializer: "__ERC1155Rarible_init",
      }
    );

    await erc1155rarible.deployed();

    console.log(erc1155rarible.address, " erc1155rarible(proxy) address");
    console.log(
      await upgrades.erc1967.getImplementationAddress(erc1155rarible.address),
      " erc1155rarible implementation address"
    );
    console.log(await upgrades.erc1967.getAdminAddress(erc1155rarible.address), " erc1155rarible admin address\n");


    erc1155RaribleBeacon = await ERC1155RaribleBeacon.deploy(erc1155rarible.address);
    await erc1155RaribleBeacon.deployed();
  
    console.log(erc1155RaribleBeacon.address, "ERC1155Beacon contract deployed \n");


    erc1155raribleFactoryC2 = await ERC1155RaribleFactoryC2.deploy(erc1155RaribleBeacon.address, transferProxy.address, lazyTransferProxy1155.address);
    await erc1155raribleFactoryC2.deployed();

    console.log(erc1155raribleFactoryC2.address, "ERC-1155 Token Factory contract deployed \n");


    exchangeV2 = await upgrades.deployProxy(
      ExchangeV2,
      [
        transferProxy.address,
        erc20TransferProxy.address,
        600,
        "0xD06e027d64CF2a1557B0c79109C60a85d1d32Cc7",
        royaltiesRegistry.address,
      ],
      {
        initializer: "__ExchangeV2_init",
      }
    );
    await exchangeV2.deployed();

    console.log(exchangeV2.address, " exchangeV2(proxy) address");
    console.log(
      await upgrades.erc1967.getImplementationAddress(exchangeV2.address),
      " exchangeV2 implementation address"
    );
    console.log(await upgrades.erc1967.getAdminAddress(exchangeV2.address), " exchangeV2 admin address\n");
  });
});
