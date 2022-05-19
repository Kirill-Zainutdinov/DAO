// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMyERC20 {
    function mint(address, uint) external;
    function burn(address, uint) external;
    function name() external returns(string memory);
    function totalSupply() external returns(uint);
    function transferFrom(address, address, uint) external returns(bool);
    function transfer(address, uint) external returns(bool);
}
