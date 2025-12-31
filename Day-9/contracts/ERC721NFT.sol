// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyERC721NFT is ERC721 {
    uint256 public tokenId;

    constructor() ERC721("My NFT", "MNFT") {}

    function mintNFT(address to) public {
        tokenId++;
        _mint(to, tokenId);
    }
}
