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
  await composableNFTInstance.configureSlots([1,2,3], [erc721ItemContractAddress, erc721ItemContractAddress, erc721ItemContractAddress]);
  console.log("Done to configure slots");
  
  await composableNFTInstance.mint(signerAddress, "");
  console.log("Mint 1st SVGComposableNFT");

  await composableNFTInstance.mint(signerAddress, "");
  console.log("Mint 2nd SVGComposableNFT");

  await composableNFTInstance.mint(signerAddress, "");
  console.log("Mint 3rd SVGComposableNFT");
  
  const erc721Item = await ethers.getContractFactory("ERC721Item");
  const erc721ItemWithSigher = await erc721Item.connect(signers[0]);
  const erc721ItemInstance = await erc721ItemWithSigher.attach(erc721ItemContractAddress);
  await erc721ItemInstance.setApprovalForAll(composableNFTDeployment.address, true);
  console.log("Done to approve ", composableNFTDeployment.address);
  await erc721ItemInstance.mint(signerAddress, "");
  console.log("Done to mint 1st erc721Item");
  await erc721ItemInstance.mint(signerAddress, "");
  console.log("Done to mint 2nd erc721Item");
  await erc721ItemInstance.mint(signerAddress, "");
  console.log("Done to mint 3rd erc721Item");
  await composableNFTInstance.attachBatch(1, [1,2], [2, 3], [1,1]);
  console.log("Done to attach slots");
  const slotsInfo = await composableNFTInstance.getTokenSlotsInfo(1);
  console.log("slotsInfo: ", slotsInfo);

  let is1155AssetSlot = await composableNFTInstance.is1155AssetSlot(1);
  console.log("slot1 is1155AssetSlot: ", is1155AssetSlot);
  let is721AssetSlot = await composableNFTInstance.is721AssetSlot(2);
  console.log("slot2 is721AssetSlot: ", is721AssetSlot);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
