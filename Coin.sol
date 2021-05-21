pragma solidity ^0.5.0;

contract Coin{
	address CentralBank = 0x70fdAc39369d55464b410e2fCbbd4b78E002eD25;
	mapping(address => float) balances;
	mapping(address => uint) bonds;
	mapping(address => uint) shares;
	address[] public Users;

	function transferAmount(address _to, float _amount) public payable{
		require(_amount <= balances[msg.sender]);
		balances[msg.sender]-=_amount;
		balances[_to]+=_amount;
	}

	function getBalance(address _owner) public view returns (float){
		return balances[_owner];
	}

	
	function mint(float _amount){
		require(msg.sender == CentralBank);
		balances[CentralBank]+=_amount;
		uint totalShares = shares[CentralBank];
		for (int i=0; i<Users.length;i++)
		{
			if (shares[i] > 0){
				float new_coins = (shares[i] / float(totalShares)) * _amount;
			}
		}
	}
	
	function burn(address _from,uint _amount) payable{
		balances[CentralBank]-=_amount;
		balances[_from]-=_amount;
	}
}
