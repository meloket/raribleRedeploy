const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const TransferProxy = await ethers.getContractFactory("TransferProxy");
  const ERC20TransferProxy = await ethers.getContractFactory("ERC20TransferProxy");
  const ERC721LazyMintTransferProxy = await ethers.getContractFactory("ERC721LazyMintTransferProxy");
  const ERC1155LazyMintTransferProxy = await ethers.getContractFactory("ERC1155LazyMintTransferProxy");
  const ERC721Rarible = await ethers.getContractFactory("ERC721Rarible");
  const ERC1155Rarible = await ethers.getContractFactory("ERC1155Rarible");
  const RoyaltiesRegistry = await ethers.getContractFactory("RoyaltiesRegistry");
  const ExchangeV2 = await ethers.getContractFactory("ExchangeV2");


  const transferProxy = await TransferProxy.deploy();
  await transferProxy.deployed();

  console.log("transferProxy contract deployed: ", transferProxy.address);


  const erc20TransferProxy = await ERC20TransferProxy.deploy();
  await erc20TransferProxy.deployed();

  console.log("erc20TransferProxy contract deployed: ", erc20TransferProxy.address);


  const lazyTransferProxy721 = await ERC721LazyMintTransferProxy.deploy();
  await lazyTransferProxy721.deployed();

  console.log("lazyTransferProxy721 contract deployed: ", lazyTransferProxy721.address);

  const lazyTransferProxy1155 = await ERC1155LazyMintTransferProxy.deploy();
  await lazyTransferProxy1155.deployed();

  console.log("lazyTransferProxy1155 contract deployed: ", lazyTransferProxy1155.address);


  const royaltiesRegistry = await upgrades.deployProxy(RoyaltiesRegistry, [], {
    initializer: "__RoyaltiesRegistry_init",
  });
  await royaltiesRegistry.deployed();

  console.log(royaltiesRegistry.address, " royaltiesRegistry(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(royaltiesRegistry.address),
    " royaltiesRegistry implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(royaltiesRegistry.address), " royaltiesRegistry admin address");


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

  console.log(erc721rarible.address, " erc721rarible(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(erc721rarible.address),
    " erc721rarible implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(erc721rarible.address), " erc721rarible admin address");


  const erc1155rarible = await upgrades.deployProxy(
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
  console.log(await upgrades.erc1967.getAdminAddress(erc1155rarible.address), " erc1155rarible admin address");
  

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

  console.log(exchangeV2.address, " exchangeV2(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(exchangeV2.address),
    " exchangeV2 implementation address"
  );
  console.log(await upgrades.erc1967.getAdminAddress(exchangeV2.address), " exchangeV2 admin address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
