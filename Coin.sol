pragma solidity ^0.5.0;

contract Coin{
	address centralBankAddress = 0x0000000000000000000000000000000000000000;  //TODO: Fill Central Bank address here

	mapping(address => uint) balances;
	mapping(address => uint) bonds;
	mapping(address => uint) shares;
	address[] public users;

	function transferAmount(address _to, uint _amount) public payable{
		require(_amount <= balances[msg.sender]);
		balances[msg.sender]-=_amount;
		balances[_to]+=_amount;
	}

	function getBalance(address _user) public view returns (uint){
		return balances[_user];
	}

	
	function InflateBalance(uint _amount) public{
		require(msg.sender == centralBankAddress);
		balances[centralBankAddress]+=_amount;
		uint totalShares = shares[centralBankAddress];
		// devide added amount to all users holding shares respectivley
		for (uint i=0; i<users.length; i++)
		{
			if (shares[users[i]] > 0){
				uint new_coins = (shares[users[i]] / totalShares) * _amount;
				balances[users[i]] += new_coins;
			}
		}
	}
	
	function produceShare(address _to, uint _amount) public payable{
		require(msg.sender == centralBankAddress);
		shares[centralBankAddress]+=_amount;
		shares[_to]+=_amount;
	}
	
	function sellBond(uint _amount) public payable{
		require(bonds[msg.sender] >= _amount);
		bonds[msg.sender]-=_amount;
		
		// User gets _amount of real USD $
	}
	
	function buyBond(uint _amount) public payable{
		require(balances[msg.sender] >= _amount);
		bonds[msg.sender]+=_amount;
		balances[msg.sender]-=_amount;
		balances[centralBankAddress]-=_amount;
	}
}
