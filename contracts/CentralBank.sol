pragma solidity ^0.5.0;
import "./Coin.sol";
import "./Oracle.sol";

contract CentralBank{
	uint mod = 100;
	address centralBankAddress = address(this);
	// Coin
	Coin _coin_contract;
	// Oracle
	Oracle _oracle_contract;
	//Coin to dollar ratio. (if > 1 need to infalte coin base, if < 1 need users to buy bons and lower the amount of total coins)
	uint C2D_ratio;

    event Log(address indexed sender, string message);
    
    function setCoin(address _coin_address) public {
         _coin_contract = Coin(_coin_address);
    }
  
    function setOracle(address _oracle_address) public {
         _oracle_contract = Oracle(_oracle_address);
    }
	
	function updateC2D() public {
		uint current_amount = _coin_contract.getBalance(centralBankAddress);
		// C2D_ratio = _oracle_contract.getC2DRatio(current_amount);
		// currently use random between [50, 150]
		uint randomNum = (uint(keccak256(abi.encodePacked(
				  now, 
				  block.difficulty, 
				  msg.sender
				))) % mod);
				
		// Make ratio between mod/2 and mod*3/2
		C2D_ratio = randomNum + mod/2;
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
	
	function getCoinAddress() public view returns (address){
		return address(_coin_contract);
	}
	
	function getOracleAddress() public view returns (address){
		return address(_oracle_contract);
	}
}
