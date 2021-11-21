//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BadToken is ERC20 {
    constructor() ERC20("BadToken", "BTN") {
        _mint(msg.sender, 1000e18);
    }
}
