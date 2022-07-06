require("@nomiclabs/hardhat-etherscan");
const { ethers, upgrades, run } = require("hardhat");

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  const TransferProxy = await ethers.getContractFactory("TransferProxy");
  const ERC20TransferProxy = await ethers.getContractFactory("ERC20TransferProxy");
  const ERC721LazyMintTransferProxy = await ethers.getContractFactory("ERC721LazyMintTransferProxy");
  const ERC1155LazyMintTransferProxy = await ethers.getContractFactory("ERC1155LazyMintTransferProxy");
  const ERC721Rarible = await ethers.getContractFactory("ERC721Rarible");
  const ERC1155Rarible = await ethers.getContractFactory("ERC1155Rarible");
  const RoyaltiesRegistry = await ethers.getContractFactory("RoyaltiesRegistry");
  const ExchangeV2 = await ethers.getContractFactory("ExchangeV2");
  const ERC721RaribleBeacon = await ethers.getContractFactory("ERC721RaribleBeacon");
  const ERC721RaribleFactoryC2 = await ethers.getContractFactory("ERC721RaribleFactoryC2");

  const transferProxy = await TransferProxy.deploy();
  await transferProxy.deployed();

  console.log(transferProxy.address, "NFT Transfer Proxy (for Approvals) deployed ");

  const erc20TransferProxy = await ERC20TransferProxy.deploy();
  await erc20TransferProxy.deployed();

  console.log(erc20TransferProxy.address, "erc20TransferProxy contract deployed ");

  const lazyTransferProxy721 = await ERC721LazyMintTransferProxy.deploy();
  await lazyTransferProxy721.deployed();

  console.log(lazyTransferProxy721.address, "lazyTransferProxy721 contract deployed ");

  const lazyTransferProxy1155 = await ERC1155LazyMintTransferProxy.deploy();
  await lazyTransferProxy1155.deployed();

  console.log(lazyTransferProxy1155.address, "lazyTransferProxy1155 contract deployed ");


  const royaltiesRegistry = await upgrades.deployProxy(RoyaltiesRegistry, [], {
    initializer: "__RoyaltiesRegistry_init",
  });
  await royaltiesRegistry.deployed();

  console.log(royaltiesRegistry.address, " External Royalties(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(royaltiesRegistry.address),
    " External Royalties implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(royaltiesRegistry.address), " External Royalties admin address");

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
  console.log(await upgrades.erc1967.getAdminAddress(erc721rarible.address), " Asset Contract Erc721 admin address");


  const erc721RaribleBeacon = await ERC721RaribleBeacon.deploy(erc721rarible.address);
  await erc721RaribleBeacon.deployed();

  console.log(erc721RaribleBeacon.address, "ERC721Beacon contract deployed ");


  const erc721raribleFactoryC2 = await ERC721RaribleFactoryC2.deploy(erc721RaribleBeacon.address, transferProxy.address, lazyTransferProxy721.address);
  await erc721raribleFactoryC2.deployed();

  console.log(erc721raribleFactoryC2.address, "ERC-721 Token Factory contract deployed ");


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
  console.log(await upgrades.erc1967.getAdminAddress(erc1155rarible.address), " Asset Contract Erc1155 admin address");

  const exchangeV2 = await upgrades.deployProxy(
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

  console.log(exchangeV2.address, " Exchange Contract(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(exchangeV2.address),
    " Exchange Contract implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(exchangeV2.address), " Exchange Contract admin address");

  //wait for 10 seconds.
  await sleep(10000);

  //Verify Contracts
  console.log("start verifying contracts");

  await run("verify:verify", {
    address: transferProxy.address,
    contract: "TransferProxy",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: erc20TransferProxy.address,
    contract: "ERC20TransferProxy",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: lazyTransferProxy721.address,
    contract: "ERC721LazyMintTransferProxy",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: lazyTransferProxy1155.address,
    contract: "ERC1155LazyMintTransferProxy",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: erc721raribleFactoryC2.address,
    contract: "ERC721RaribleFactoryC2",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: royaltiesRegistry.address,
    contract: "RoyaltiesRegistry",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: erc721rarible.address,
    contract: "ERC721Rarible",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: erc721RaribleBeacon.address,
    contract: "ERC721RaribleBeacon",
    constructorArguments: [erc721rarible.address],
  });

  await run("verify:verify", {
    address: erc721raribleFactoryC2.address,
    contract: "ERC721RaribleFactoryC2",
    constructorArguments: [erc721RaribleBeacon.address, transferProxy.address, lazyTransferProxy721.address],
  });

  await run("verify:verify", {
    address: erc1155rarible.address,
    contract: "ERC1155Rarible",
    constructorArguments: [],
  });

  await run("verify:verify", {
    address: exchangeV2.address,
    contract: "ExchangeV2",
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
