// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ERC721Item is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal virtual
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) override(ERC721, ERC721URIStorage) public virtual view returns (string memory) {
        string memory basePart = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 12px; }</style><svg width="400" height="180">';
        uint rectyPos;
        uint textyPos;
        string memory output = basePart;
        for (uint i = 0; i < 1; i++) {
            rectyPos = 20 + 40 * i;
            textyPos = 38 + 40 * i;
            output = string(abi.encodePacked(output, '<g> <rect x="20" y="', Strings.toString(rectyPos), '" rx="5" ry="5" width="380" height="30" style="fill:blue;stroke:black;stroke-width:5;opacity:0.5"/><text x="188" y="', Strings.toString(textyPos), '" class="base" dominant-baseline="middle" text-anchor="middle">', Strings.toHexString(address(this)), '#', Strings.toString(tokenId), '#', Strings.toString(1), '</text></g>'));  
        }
        output = string(abi.encodePacked(output, '</svg></svg>'));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "ERC721Item #', Strings.toString(tokenId) , '", "description": "ERC721Item Demo", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function supportsInterface(bytes4 interfaceId)
        public virtual
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}