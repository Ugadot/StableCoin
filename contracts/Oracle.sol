pragma solidity ^0.5.0;

contract Oracle{

	uint mul = 100; // multiply by this factor because we must work with integers.
	uint dollars = 1000;
    
    function getC2DRatio(uint centralBankAmount) public returns (uint) {
         return ((mul * centralBankAmount) / dollars); // a ratio of 100 means coin = dollar.
    }

}