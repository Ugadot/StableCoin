pragma solidity ^0.5.0;

contract CentralBank{
	//address Oracle = 0xaaa;  //TODO: Fill Oracle address here
	uint mod = 256;

	//Coin to 2 ration if > 1 need to infalte coin base, if < 1 need users to buy bons and lower the amount of total coins
	float C2D_ratio;
  
	function updateC2D(Coin _coin_contract) public {
		// C2D_ration = Oracle.getRatio();
		// currently use random between [0.5, 1.5]
		uint randomNum = uint(keccak256(abi.encodePacked(
				  now, 
				  block.difficulty, 
				  msg.sender
				))) % mod;
		// Make ratio between 0.5 and 1.5

		C2D_ratio = (randomNum + mod / 2) / float(mod / 2);
		float current_amount = _coin_contract.getTotalAmount();
		if (C2D_ratio > 1)
		{
			float _amount_to_inflate = current_amount * C2D_ratio - current_amount;
			_coin_contract.InflateBalance(_amount_to_inflate);
		}
	}
	
	function getC2D() public returns(float){
		return C2D_ratio;
	}
	
