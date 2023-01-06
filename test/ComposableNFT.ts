import { expect } from "chai";
import { ethers } from "hardhat";

describe("ComposableNFT contract", function () {
    it("Deployment with no slots properly", async function () {  
      const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
  
      const hardhatToken = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");
  
      const slotsLength = await hardhatToken.slotsLength();
      expect(slotsLength).to.equal(0);
    });

    it("Deployment with erc721 slots properly", async function () {
        // deploy ComposableNFT   
        const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
        const composableNFTInstance = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");

        // no slots configured by default, so slots length is 0
        const slotsLength = await composableNFTInstance.slotsLength();
        expect(slotsLength).to.equal(0);

        // deploy erc721
        const ERC721Item = await ethers.getContractFactory("ERC721Item");
        const erc721ItemToken = await ERC721Item.deploy("721Item", "721Item");

        // configure deployed erc721 as slot 1 asset
        await composableNFTInstance.configureSlots([1], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(1);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc721ItemToken.address);
        // one slot can only be configured once
        await expect(composableNFTInstance.configureSlots([1], [erc721ItemToken.address])).to.be.revertedWith("Slot exists");

        // configure another slot
        await composableNFTInstance.configureSlots([2], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(2);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc721ItemToken.address);

        // prepare data
        const [signer] = await ethers.getSigners();
        await composableNFTInstance.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.setApprovalForAll(composableNFTInstance.address, true);
        // attach #0 erc721 item to slot #1 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 1, 0, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach #1 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 2, 1, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach #2 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.replace(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // detach #2 slot assets from #0 composable nft
        await composableNFTInstance.detach(0, 2);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach again
        await composableNFTInstance.attachSlot(0, 2, 1, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));

        await composableNFTInstance.mint(signer.address, "");
        // transfer slot assets for slot #2 from #0 to #1 composable NFT
        await composableNFTInstance.transferSlotAsset(0, 1, 2, 1)
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // console.log(await composableNFTInstance.getTokenSlotsInfo(1));
    });

    it("Should attach composable nft properly", async function () {
        // deploy ComposableNFT   
        const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
        const composableNFTInstance = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");

        // no slots configured by default, so slots length is 0
        const slotsLength = await composableNFTInstance.slotsLength();
        expect(slotsLength).to.equal(0);

        const erc721ItemToken = composableNFTInstance;

        // configure deployed erc721 as slot 1 asset
        await composableNFTInstance.configureSlots([1], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(1);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc721ItemToken.address);
        // one slot can only be configured once
        await expect(composableNFTInstance.configureSlots([1], [erc721ItemToken.address])).to.be.revertedWith("Slot exists");

        // configure another slot
        await composableNFTInstance.configureSlots([2], [erc721ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(2);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc721ItemToken.address);

        // prepare data
        const [signer] = await ethers.getSigners();
        await composableNFTInstance.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.mint(signer.address, "");
        await erc721ItemToken.setApprovalForAll(composableNFTInstance.address, true);
        // attach #1 erc721 item to slot #1 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 1, 1, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach #2 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach #2 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.replace(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // detach #2 slot assets from #0 composable nft
        await composableNFTInstance.detach(0, 2);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // attach again
        await composableNFTInstance.attachSlot(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));

        await composableNFTInstance.mint(signer.address, "");
        // transfer slot assets for slot #2 from #0 to #1 composable NFT
        await composableNFTInstance.transferSlotAsset(0, 3, 2, 1)
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // console.log(await composableNFTInstance.getTokenSlotsInfo(3));
    });
    it("Should attach 1155 nft properly", async function () {
        // deploy ComposableNFT   
        const ComposableNFT = await ethers.getContractFactory("ComposableNFT");
        const composableNFTInstance = await ComposableNFT.deploy("ComposableNFT", "ComposableNFT");

        // no slots configured by default, so slots length is 0
        const slotsLength = await composableNFTInstance.slotsLength();
        expect(slotsLength).to.equal(0);

        // deploy erc1155
        const ERC1155Item = await ethers.getContractFactory("ERC1155Item");
        const erc1155ItemToken = await ERC1155Item.deploy();

        // configure deployed erc1155 as slot 1 asset
        await composableNFTInstance.configureSlots([1], [erc1155ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(1);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc1155ItemToken.address);
        // one slot can only be configured once
        await expect(composableNFTInstance.configureSlots([1], [erc1155ItemToken.address])).to.be.revertedWith("Slot exists");

        // configure another slot
        await composableNFTInstance.configureSlots([2], [erc1155ItemToken.address]);
        expect(await composableNFTInstance.slotsLength()).to.equal(2);
        expect(await composableNFTInstance.slotAsset(1)).to.equal(erc1155ItemToken.address);

        // prepare data
        const [signer] = await ethers.getSigners();
        await composableNFTInstance.mint(signer.address, "");
        await erc1155ItemToken.mint(signer.address, 0, 5, "0x00");
        await erc1155ItemToken.mint(signer.address, 1, 5, "0x00");
        await erc1155ItemToken.mint(signer.address, 2, 5, "0x00");
        await erc1155ItemToken.setApprovalForAll(composableNFTInstance.address, true);
        // // attach #1 erc1155 item to slot #1 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 1, 1, 3);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // // attach #2 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.attachSlot(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // // attach #2 erc721 item to slot #2 of #0 composable nft
        await composableNFTInstance.replace(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // // detach #2 slot assets from #0 composable nft
        await composableNFTInstance.detach(0, 2);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // // attach again
        await composableNFTInstance.attachSlot(0, 2, 2, 1);
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));

        await composableNFTInstance.mint(signer.address, "");
        // // transfer slot assets for slot #2 from #0 to #1 composable NFT
        await composableNFTInstance.transferSlotAsset(0, 3, 2, 1)
        // console.log(await composableNFTInstance.getTokenSlotsInfo(0));
        // console.log(await composableNFTInstance.getTokenSlotsInfo(3));
    });  
});