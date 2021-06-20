pragma solidity ^0.5.0;
import "./Coin.sol";
import "./Oracle.sol";

contract CentralBank{
	uint constant coinUnit = 1000000; // amount of mini-units in one coin (needed because there's no float in solidity)
	uint constant bondUnit = 1000; // amount of bonds in one unit (needed because there's no float in solidity)
	address centralBankAddress = address(this);
	// Coin
	Coin _coin_contract;
	// Oracle
	Oracle _oracle_contract;
	//Coin to dollar ratio. (if > 1 need to infalte coin base, if < 1 need users to buy bons and lower the amount of total coins)
	uint C2D_ratio = coinUnit;
	
    event Log(address indexed sender, string message);
    
    function setCoin(address _coin_address) public {
         _coin_contract = Coin(_coin_address);
    }
  
    function setOracle(address _oracle_address) public {
         _oracle_contract = Oracle(_oracle_address);
    }
	
	function updateC2D() public {

		emit Log(msg.sender, "begin update C2D");
		uint current_amount = _coin_contract.getBalance();
		C2D_ratio = _oracle_contract.getC2DRatio(current_amount);
				
		if (C2D_ratio > coinUnit)
		{
			uint _amount_to_inflate = (current_amount * C2D_ratio) / coinUnit - current_amount;
			_coin_contract.InflateBalance(_amount_to_inflate);
		} 
		else if (C2D_ratio < coinUnit){
			uint bonds_amount = bondUnit * (current_amount - (current_amount * C2D_ratio) / coinUnit) / coinUnit;
			_coin_contract.initAuction(bonds_amount);
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
