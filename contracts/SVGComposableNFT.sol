// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./ComposableNFT.sol";

contract SVGComposableNFT is ComposableNFT {
    constructor(string memory name, string memory symbol) ComposableNFT(name, symbol) {}

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        string memory basePart = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 12px; }</style><svg width="400" height="180">';
        uint currentSlotId;
        string memory output = basePart;
        for (uint i = 0; i < slots.length; i++) {
            string memory color = "white";
            currentSlotId = slots[i];
            if (tokenSlotsFilled[tokenId][currentSlotId]) {
                color = "blue";
            }
            output = string(abi.encodePacked(output, '<g> <rect x="20" y="', Strings.toString(20 + 40 * i), '" rx="5" ry="5" width="380" height="30" style="fill:', color, ';stroke:black;stroke-width:5;opacity:0.5"/><text x="188" y="', Strings.toString(38 + 40 * i), '" class="base" dominant-baseline="middle" text-anchor="middle">', Strings.toHexString(slotAsset[currentSlotId]), '#', Strings.toString(tokenSlotsData[tokenId][currentSlotId]), '#', Strings.toString(tokenSlotsBalance[tokenId][currentSlotId]), '</text></g>'));  
        }
        output = string(abi.encodePacked(output, '<text x="220" y="158" font-family="Verdana" font-size="15" fill="blue" dominant-baseline="middle" text-anchor="middle">Slot Demo</text></svg></svg>'));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Composer #', Strings.toString(tokenId) , '", "description": "ComposableNFT Demo", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

}