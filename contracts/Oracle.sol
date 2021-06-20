pragma solidity >= 0.5.0 < 0.6.0;

contract Oracle {

    uint bitCoinDollars;
	uint coinUnit = 1000000; // multiply by this factor because we must work with integers.

	
    function update(uint ratio) public {
		bitCoinDollars = ratio;
    }
    
    function getC2DRatio(uint centralBankAmount) public view returns (uint) {
         return ((coinUnit * bitCoinDollars) / centralBankAmount); // a ratio of 100 means coin = dollar.
    }

}