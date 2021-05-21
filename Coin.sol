pragma solidity ^0.5.0;

contract Coin{
	address CentralBank = 0xaaa;  //TODO: Fill Central Bank address here
	mapping(address => float) balances;
	mapping(address => uint) bonds;
	mapping(address => uint) shares;
	address[] public Users;

	function transferAmount(address _to, float _amount) public payable{
		require(_amount <= balances[msg.sender]);
		balances[msg.sender]-=_amount;
		balances[_to]+=_amount;
	}

	function getBalance(address _user) public view returns (float){
		return balances[_user];
	}

	
	function InflateBalance(float _amount){
		require(msg.sender == CentralBank);
		balances[CentralBank]+=_amount;
		uint totalShares = shares[CentralBank];
		// devide added amount to all users holding shares respectivley
		for (int i=0; i<Users.length;i++)
		{
			if (shares[i] > 0){
				float new_coins = (shares[i] / float(totalShares)) * _amount;
				balances[i] += new_coins;
			}
		}
	}
	
	function produceShare(address _to, uint _amount) payable{
		require(msg.sender == CentralBank);
		shares[CentralBank]+=_amount;
		shares[_to]+=_amount;
	}
	
	function sellBond(uint _amount) payable{
		require(bonds[msg.sender] >= _amount);
		bonds[msg.sender]-=_amount;
		
		// User gets _amount of real USD $
	}
	
	function buyBond(uint _amount) payable{
		require(balances[msg.sender] >= _amount);
		bonds[msg.sender]+=_amount;
		balances[msg.sender]-=_amount;
		balances[CentralBank]-=_amount;
	}
}
