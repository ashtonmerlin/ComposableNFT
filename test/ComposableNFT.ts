import { expect } from "chai";
import { ethers } from "hardhat";

describe("ComposableNFT contract", function () {
    it("Deployment with no slots", async function () {  
      const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
  
      const hardhatToken = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");
  
      const slotsLength = await hardhatToken.slotsLength();
      expect(slotsLength).to.equal(0);
    });

    it("Deployment with erc721 slots", async function () {    
        const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
    
        const composableNFTInstance = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");
    
        const slotsLength = await composableNFTInstance.slotsLength();
        expect(slotsLength).to.equal(0);

        const ERC721Item = await ethers.getContractFactory("ERC721Item");
        const erc721ItemToken = await ERC721Item.deploy("721Item", "721Item");
        await composableNFTInstance.configureSlots([1], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(1);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc721ItemToken.address);
        await expect(composableNFTInstance.configureSlots([1], [erc721ItemToken.address])).to.be.revertedWith("Slot exists");

        await composableNFTInstance.configureSlots([2], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(2);

        const [signer] = await ethers.getSigners();
        await composableNFTInstance.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.setApprovalForAll(composableNFTInstance.address, true);
        await composableNFTInstance.attachSlot(0, 1, 0, 1);
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        await composableNFTInstance.attachSlot(0, 2, 1, 1);
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        await composableNFTInstance.replace(0, 2, 2, 1);
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        await composableNFTInstance.detach(0, 2);
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        await composableNFTInstance.attachSlot(0, 2, 1, 1);
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));

        await composableNFTInstance.mint(signer.address, "");
        await composableNFTInstance.transferSlotAsset(0, 1, 2, 1)
        console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        console.log(await composableNFTInstance.getTokenSlotsInfo(1));

      });
      
});