// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockVRFCoordinator {
    uint256 public lastRequestId;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256 requestId) {
        lastRequestId++;
        return lastRequestId;
    }

    // Manually trigger the VRF callback on consumer
    function fulfillRandomWords(
        address consumer,
        uint256 requestId,
        uint256 randomness
    ) external {
        uint256[] memory words = new uint256[](1);
        words[0] = randomness;

        (bool success, ) = consumer.call(
            abi.encodeWithSignature(
                "fulfillRandomWords(uint256,uint256[])",
                requestId,
                words
            )
        );

        require(success, "VRF callback failed");
    }
}
