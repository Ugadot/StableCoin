pragma solidity ^0.5.0;
import "./Coin.sol";

contract CentralBank{
	//address Oracle = 0xaaa;  //TODO: Fill Oracle address here
	uint mod = 100;
	address centralBankAddress = address(this);

	//Coin to 2 ration if > 1 need to infalte coin base, if < 1 need users to buy bons and lower the amount of total coins
	uint C2D_ratio;
	Coin _coin_contract;
    event Log(address indexed sender, string message);
    
    function setCoin(address _coin_address) public {
         _coin_contract = Coin(_coin_address);  
    }
  
	function updateC2D() public {
		// C2D_ration = Oracle.getRatio();
		// currently use random between [50, 150]
		uint randomNum = (uint(keccak256(abi.encodePacked(
				  now, 
				  block.difficulty, 
				  msg.sender
				))) % mod);
				
		// Make ratio between mod/2 and mod*3/2
		C2D_ratio = randomNum + mod/2;
		uint current_amount = _coin_contract.getBalance(centralBankAddress);
		if (C2D_ratio > mod)
		{
            emit Log(msg.sender, "C2D_ratio > mod");
			uint _amount_to_inflate = (current_amount * C2D_ratio) / mod - current_amount;
			_coin_contract.InflateBalance(_amount_to_inflate);
		}
	}
	
	function getC2D() public view returns (uint){
		return C2D_ratio;
	}
}
