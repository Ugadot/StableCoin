pragma solidity >= 0.5.0 < 0.6.0;
import "./provableAPI.sol";

contract Oracle is usingProvable {

    uint bitCoinDollars;
	uint mul = 100; // multiply by this factor because we must work with integers.
    event LogNewDieselPrice(string price);
    event LogNewProvableQuery(string description);
	
    constructor() public payable {
        update(); // First check at contract creation...
    }
	
    function __callback(bytes32 _myid, string memory _result) public {
        require(msg.sender == provable_cbAddress());
        emit LogNewDieselPrice(_result);
        bitCoinDollars = parseInt(_result, 2); // Let's save it as cents...
    }
	
    function update() public payable {
        emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");
        return;
		provable_query("URL", "https://blockchain.info/tobtc?currency=USD&value=50000000");
    }
    
    function getC2DRatio(uint centralBankAmount) public view returns (uint) {
         return ((mul * bitCoinDollars * 100000) / centralBankAmount); // a ratio of 100 means coin = dollar.
    }

}