const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const ERC1155Rarible = await ethers.getContractFactory("ERC1155Rarible");

  const erc1155rarible = await upgrades.deployProxy(
    ERC1155Rarible,
    ["FreeMintable", "TST", "ipfs:/", "ipfs:/", "0xB6961fE7ad9Ed29FD796773087126D6E45463e0a", "0x1750Aab813d3E6698Eb8255f98589d7BCf1aeCeD"],
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
