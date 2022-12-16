import { ethers } from "hardhat";
const { deployments } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  const signerAddress = signers[0].address;
  console.log("signer: ", signers[0].address);

  const erc721ItemDeployment = await deployments.get("ERC721Item");
  const erc721ItemContractAddress = erc721ItemDeployment.address;
  console.log("erc721ItemContractAddress: ", erc721ItemContractAddress)

  const erc1155ItemDeployment = await deployments.get("ERC1155Item");
  const erc1155ItemContractAddress = erc1155ItemDeployment.address;
  console.log("erc1155ItemContractAddress: ", erc1155ItemContractAddress)

  const SVGComposableNFT = await ethers.getContractFactory("SVGComposableNFT");
  const ComposableNFTWithSigher = await SVGComposableNFT.connect(signers[0]);
  const composableNFTDeployment = await deployments.get("SVGComposableNFT");
  const composableNFTInstance = await ComposableNFTWithSigher.attach(composableNFTDeployment.address);
//   await composableNFTInstance.configureSlots([1,2,3], [erc721ItemContractAddress, erc721ItemContractAddress, erc1155ItemContractAddress]);
//   console.log("Done to configure slots");
  
  await composableNFTInstance.mint(signerAddress, "");
  console.log("Mint one SVGComposableNFT");
  
  const erc721Item = await ethers.getContractFactory("ERC721Item");
  const erc721ItemWithSigher = await erc721Item.connect(signers[0]);
  const erc721ItemInstance = await erc721ItemWithSigher.attach(erc721ItemContractAddress);
  await erc721ItemInstance.setApprovalForAll(composableNFTDeployment.address, true);
  console.log("Done to approve ", composableNFTDeployment.address);
  await erc721ItemInstance.mint(signerAddress, "");
  console.log("Done to mint one erc721Item");
  await erc721ItemInstance.mint(signerAddress, "");
  console.log("Done to mint another erc721Item");
  await composableNFTInstance.attachBatch(0, [1,2], [0, 1], [1,1]);

  const slotsInfo = await composableNFTInstance.getTokenSlotsInfo(1);
  console.log("slotsInfo: ", slotsInfo);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
