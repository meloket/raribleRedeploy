require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const { ethers, upgrades, run } = require("hardhat");

const { NEW_PROTOCOL_FEE, NEW_DEFAULT_FEE_RECEIVER } = process.env;

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const TransferProxy = await ethers.getContractFactory(
    "@rarible/transfer-proxy/contracts/proxy/TransferProxy.sol:TransferProxy"
  );
  const ERC20TransferProxy = await ethers.getContractFactory(
    "@rarible/transfer-proxy/contracts/proxy/ERC20TransferProxy.sol:ERC20TransferProxy"
  );
  const ERC721LazyMintTransferProxy = await ethers.getContractFactory(
    "@rarible/transfer-proxy/contracts/lazy-mint/erc721/ERC721LazyMintTransferProxy.sol:ERC721LazyMintTransferProxy"
  );
  const ERC1155LazyMintTransferProxy = await ethers.getContractFactory(
    "@rarible/transfer-proxy/contracts/lazy-mint/erc1155/ERC1155LazyMintTransferProxy.sol:ERC1155LazyMintTransferProxy"
  );
  const ERC721Rarible = await ethers.getContractFactory(
    "@rarible/tokens/contracts/erc-721/ERC721Rarible.sol:ERC721Rarible"
  );
  const ERC1155Rarible = await ethers.getContractFactory(
    "@rarible/tokens/contracts/erc-1155/ERC1155Rarible.sol:ERC1155Rarible"
  );
  const RoyaltiesRegistry = await ethers.getContractFactory(
    "@rarible/royalties-registry/contracts/RoyaltiesRegistry.sol:RoyaltiesRegistry"
  );
  const ExchangeV2 = await ethers.getContractFactory("@rarible/exchange-v2/contracts/ExchangeV2.sol:ExchangeV2");
  const ERC721RaribleBeacon = await ethers.getContractFactory(
    "@rarible/tokens/contracts/beacons/ERC721RaribleBeacon.sol:ERC721RaribleBeacon"
  );
  const ERC721RaribleFactoryC2 = await ethers.getContractFactory(
    "@rarible/tokens/contracts/create-2/ERC721RaribleFactoryC2.sol:ERC721RaribleFactoryC2"
  );
  const ERC1155RaribleBeacon = await ethers.getContractFactory(
    "@rarible/tokens/contracts/beacons/ERC1155RaribleBeacon.sol:ERC1155RaribleBeacon"
  );
  const ERC1155RaribleFactoryC2 = await ethers.getContractFactory(
    "@rarible/tokens/contracts/create-2/ERC1155RaribleFactoryC2.sol:ERC1155RaribleFactoryC2"
  );

  const transferProxy = await TransferProxy.deploy();
  await transferProxy.deployed();

  console.log(transferProxy.address, "NFT Transfer Proxy (for Approvals) deployed \n");

  const erc20TransferProxy = await ERC20TransferProxy.deploy();
  await erc20TransferProxy.deployed();

  console.log(erc20TransferProxy.address, "erc20TransferProxy contract deployed \n");

  const lazyTransferProxy721 = await ERC721LazyMintTransferProxy.deploy();
  await lazyTransferProxy721.deployed();

  console.log(lazyTransferProxy721.address, "lazyTransferProxy721 contract deployed \n");

  const lazyTransferProxy1155 = await ERC1155LazyMintTransferProxy.deploy();
  await lazyTransferProxy1155.deployed();

  console.log(lazyTransferProxy1155.address, "lazyTransferProxy1155 contract deployed \n");

  const royaltiesRegistry = await upgrades.deployProxy(RoyaltiesRegistry, [], {
    initializer: "__RoyaltiesRegistry_init",
  });
  await royaltiesRegistry.deployed();

  console.log(royaltiesRegistry.address, " External Royalties(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(royaltiesRegistry.address),
    " External Royalties implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(royaltiesRegistry.address), " External Royalties admin address\n");

  const erc721rarible = await upgrades.deployProxy(
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

  console.log(erc721rarible.address, " Asset Contract Erc721(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(erc721rarible.address),
    " Asset Contract Erc721 implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(erc721rarible.address), " Asset Contract Erc721 admin address\n");

  const erc721RaribleBeacon = await ERC721RaribleBeacon.deploy(erc721rarible.address);
  await erc721RaribleBeacon.deployed();

  console.log(erc721RaribleBeacon.address, "ERC721Beacon contract deployed \n");

  const erc721raribleFactoryC2 = await ERC721RaribleFactoryC2.deploy(erc721RaribleBeacon.address, transferProxy.address, lazyTransferProxy721.address);
  await erc721raribleFactoryC2.deployed();

  console.log(erc721raribleFactoryC2.address, "ERC-721 Token Factory contract deployed \n");

  const erc1155rarible = await upgrades.deployProxy(
    ERC1155Rarible,
    ["FreeMintable", "TST", "ipfs:/", "ipfs:/", transferProxy.address, lazyTransferProxy1155.address],
    {
      initializer: "__ERC1155Rarible_init",
    }
  );

  await erc1155rarible.deployed();

  console.log(erc1155rarible.address, " Asset Contract Erc1155(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(erc1155rarible.address),
    " Asset Contract Erc1155 implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(erc1155rarible.address), " Asset Contract Erc1155 admin address\n");

  const erc1155RaribleBeacon = await ERC1155RaribleBeacon.deploy(erc1155rarible.address);
  await erc1155RaribleBeacon.deployed();

  console.log(erc1155RaribleBeacon.address, "ERC1155Beacon contract deployed \n");

  const erc1155raribleFactoryC2 = await ERC1155RaribleFactoryC2.deploy(erc1155RaribleBeacon.address, transferProxy.address, lazyTransferProxy1155.address);
  await erc1155raribleFactoryC2.deployed();

  console.log(erc1155raribleFactoryC2.address, "ERC-1155 Token Factory contract deployed \n");

  const exchangeV2 = await upgrades.deployProxy(
    ExchangeV2,
    [
      transferProxy.address,
      erc20TransferProxy.address,
      parseInt(NEW_PROTOCOL_FEE),
      NEW_DEFAULT_FEE_RECEIVER,
      royaltiesRegistry.address,
    ],
    {
      initializer: "__ExchangeV2_init",
    }
  );
  await exchangeV2.deployed();

  console.log(exchangeV2.address, " Exchange Contract(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(exchangeV2.address),
    " Exchange Contract implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(exchangeV2.address), " Exchange Contract admin address\n");

  // //wait for 30 seconds.
  // await sleep(30000);

  // //Verify Contracts
  // console.log("start verifying contracts");

  // await run("verify:verify", {
  //   address: transferProxy.address,
  //   contract: "@rarible/transfer-proxy/contracts/proxy/TransferProxy.sol:TransferProxy",
  // });

  // await run("verify:verify", {
  //   address: erc20TransferProxy.address,
  //   contract: "@rarible/transfer-proxy/contracts/proxy/ERC20TransferProxy.sol:ERC20TransferProxy",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: lazyTransferProxy721.address,
  //   contract: "@rarible/transfer-proxy/contracts/lazy-mint/erc721/ERC721LazyMintTransferProxy.sol:ERC721LazyMintTransferProxy",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: lazyTransferProxy1155.address,
  //   contract: "@rarible/transfer-proxy/contracts/lazy-mint/erc1155/ERC1155LazyMintTransferProxy.sol:ERC1155LazyMintTransferProxy",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: erc721raribleFactoryC2.address,
  //   contract: "contracts/ERC721RaribleFactoryC2.sol:ERC721RaribleFactoryC2",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: await upgrades.erc1967.getImplementationAddress(royaltiesRegistry.address),
  //   contract: "@rarible/royalties-registry/contracts/RoyaltiesRegistry.sol:RoyaltiesRegistry",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: await upgrades.erc1967.getImplementationAddress(erc721rarible.address),
  //   contract: "@rarible/tokens/contracts/erc-721/ERC721Rarible.sol:ERC721Rarible",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: erc721RaribleBeacon.address,
  //   contract: "@rarible/tokens/contracts/beacons/ERC721RaribleBeacon.sol:ERC721RaribleBeacon",
  //   constructorArguments: [erc721rarible.address],
  // });

  // await run("verify:verify", {
  //   address: erc721raribleFactoryC2.address,
  //   contract: "@rarible/tokens/contracts/create-2/ERC721RaribleFactoryC2.sol:ERC721RaribleFactoryC2",
  //   constructorArguments: [erc721RaribleBeacon.address, transferProxy.address, lazyTransferProxy721.address],
  // });

  // await run("verify:verify", {
  //   address: await upgrades.erc1967.getImplementationAddress(erc1155rarible.address),
  //   contract: "@rarible/tokens/contracts/erc-1155/ERC1155Rarible.sol:ERC1155Rarible",
  //   constructorArguments: [],
  // });

  // await run("verify:verify", {
  //   address: erc1155RaribleBeacon.address,
  //   contract: "@rarible/tokens/contracts/beacons/ERC1155RaribleBeacon.sol:ERC1155RaribleBeacon",
  //   constructorArguments: [erc1155rarible.address],
  // });

  // await run("verify:verify", {
  //   address: erc1155raribleFactoryC2.address,
  //   contract: "@rarible/tokens/contracts/create-2/ERC1155RaribleFactoryC2.sol:ERC1155RaribleFactoryC2",
  //   constructorArguments: [erc1155RaribleBeacon.address, transferProxy.address, lazyTransferProxy1155.address],
  // });

  // await run("verify:verify", {
  //   address: await upgrades.erc1967.getImplementationAddress(exchangeV2.address),
  //   contract: "@rarible/exchange-v2/contracts/ExchangeV2.sol:ExchangeV2",
  //   constructorArguments: [],
  // });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
