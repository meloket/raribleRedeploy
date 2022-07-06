const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const TransferProxy = await ethers.getContractFactory("TransferProxy");
  const ERC721LazyMintTransferProxy = await ethers.getContractFactory("ERC721LazyMintTransferProxy");
  const ERC721Rarible = await ethers.getContractFactory("ERC721Rarible");
  const ERC1155Rarible = await ethers.getContractFactory("ERC1155Rarible");

  const transferProxy = await TransferProxy.deploy();
  await transferProxy.deployed();

  console.log("transferProxy contract deployed: ", transferProxy.address);

  const lazyTransferProxy = await ERC721LazyMintTransferProxy.deploy();
  await lazyTransferProxy.deployed();

  console.log("lazyTransferProxy contract deployed: ", lazyTransferProxy.address);

  const erc721rarible = await upgrades.deployProxy(
    ERC721Rarible,
    [
      "FreeMintableRarible",
      "RARI",
      "https://ipfs.rarible.com",
      "https://ipfs.rarible.com",
      transferProxy.address,
      lazyTransferProxy.address,
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
    ["FreeMintable", "TST", "ipfs:/", "ipfs:/", transferProxy.address, lazyTransferProxy.address],
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
