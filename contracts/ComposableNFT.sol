// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";

import "./ERC721Item.sol";

contract ComposableNFT is ERC721Item {
    struct SlotInfo {
        uint slotId;
        address slotAssetAddress;
        uint slotAssetTokenId;
        uint slotAssetTokenAmount;
        bool slotFilled;
    }
    mapping(address => uint[]) public assetSlots;
    mapping(uint => address) public slotAsset;
    uint[] public slots;

    // currentTokenId => slotId => slotAssetTokenId
    mapping(uint => mapping(uint => uint)) tokenSlotsData;
    mapping(uint => mapping(uint => uint)) tokenSlotsBalance;
    mapping(uint => mapping(uint => bool)) tokenSlotsFilled;


    event NewSlot(uint slotId, address assetTokenAddress);

    constructor(string memory name, string memory symbol) ERC721Item(name, symbol) {}

    // Only allow contract owner to configure slot?
    // Different slot could use the same asset token contract?
    function configureSlot(uint slotId, address assetTokenAddress) public onlyOwner {
        require(ERC165Checker.supportsInterface(assetTokenAddress, type(IERC721).interfaceId) || 
                ERC165Checker.supportsInterface(assetTokenAddress, type(IERC1155).interfaceId), "Invalid asset address");
        require(slotAsset[slotId] == address(0x0), "Slot exists");

        slotAsset[slotId] = assetTokenAddress;
        assetSlots[assetTokenAddress].push(slotId);
        slots.push(slotId);

        emit NewSlot(slotId, assetTokenAddress);
    }

    function configureSlots(uint[] memory slotIds, address[] memory assetTokenAddresses) external onlyOwner {
        for (uint i = 0; i < slotIds.length; i++) {
            configureSlot(slotIds[i], assetTokenAddresses[i]);
        }
    }

    function attachBatch(uint tokenId, uint[] memory slotIds, uint[] memory slotAssetTokenIds, uint[] memory amount) external {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        require(slotIds.length == slotAssetTokenIds.length, "Inconsistent length");
        require(slotAssetTokenIds.length == amount.length, "Inconsistent length");

        for (uint i = 0; i < slotIds.length; i++) {
            attachInternal(tokenId, slotIds[i], slotAssetTokenIds[i], amount[i]);
        }
    }

    function attach(uint tokenId, uint slotId, uint slotAssetTokenId, uint amount) external {
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        
        attachInternal(tokenId, slotId, slotAssetTokenId, amount);
    }

    function attachInternal(uint tokenId, uint slotId, uint slotAssetTokenId, uint amount) internal {
        address slotAssetAddress = slotAsset[slotId];
        require(slotAssetAddress != address(0x0), "Invliad slot id");
        require(!tokenSlotsFilled[tokenId][slotId], "Slot not available");

        if (is1155AssetSlot(slotId)) {
            IERC1155(slotAssetAddress).safeTransferFrom(msg.sender, address(this), slotAssetTokenId, amount, "");
            tokenSlotsData[tokenId][slotId] = slotAssetTokenId;
            tokenSlotsBalance[tokenId][slotId] += amount;
            tokenSlotsFilled[tokenId][slotId] = true;
            return;
        }

        if (is721AssetSlot(slotId)) {
            IERC721(slotAssetAddress).safeTransferFrom(msg.sender, address(this), slotAssetTokenId);
            tokenSlotsData[tokenId][slotId] = slotAssetTokenId;
            tokenSlotsBalance[tokenId][slotId] = 1;
            tokenSlotsFilled[tokenId][slotId] = true;
        }
    }

    function detach(uint tokenId, uint slotId) external {
        address slotAssetAddress = slotAsset[slotId];
        require(slotAssetAddress != address(0x0), "Invliad slot id");
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        require(tokenSlotsFilled[tokenId][slotId], "Slot not filled");

        if (is1155AssetSlot(slotId)) {
            IERC1155(slotAssetAddress).safeTransferFrom(address(this), msg.sender, tokenSlotsData[tokenId][slotId], tokenSlotsBalance[tokenId][slotId], "");
            tokenSlotsFilled[tokenId][slotId] = false;
            tokenSlotsBalance[tokenId][slotId] = 0;
            tokenSlotsData[tokenId][slotId] = 0;
            return;
        }

        if (is721AssetSlot(slotId)) {
            IERC721(slotAssetAddress).safeTransferFrom(address(this), msg.sender, tokenSlotsData[tokenId][slotId]);
            tokenSlotsFilled[tokenId][slotId] = false;
            tokenSlotsBalance[tokenId][slotId] = 0;
            tokenSlotsData[tokenId][slotId] = 0;
        }
    }

    function getTokenSlotsInfo(uint tokenId) external view returns (SlotInfo[] memory) {
        SlotInfo[] memory tokenSlotsInfo = new SlotInfo[](slots.length);
        uint currentSlotId;
        for (uint i = 0; i < slots.length; i++) {
            currentSlotId = slots[i];
            tokenSlotsInfo[i].slotId = currentSlotId;
            tokenSlotsInfo[i].slotAssetAddress = slotAsset[currentSlotId];
            tokenSlotsInfo[i].slotAssetTokenId = tokenSlotsData[tokenId][currentSlotId];
            tokenSlotsInfo[i].slotAssetTokenAmount = tokenSlotsBalance[tokenId][currentSlotId];
            tokenSlotsInfo[i].slotFilled = tokenSlotsFilled[tokenId][currentSlotId];   
        }
        return tokenSlotsInfo;
    }

    function is1155AssetSlot(uint slotId) public view returns (bool) {
        return ERC165Checker.supportsInterface(slotAsset[slotId], type(IERC1155).interfaceId);
    }

    function is721AssetSlot(uint slotId) public view returns (bool) {
        return ERC165Checker.supportsInterface(slotAsset[slotId], type(IERC721).interfaceId);
    }

}