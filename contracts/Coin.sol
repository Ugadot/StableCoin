pragma solidity ^0.5.0;

contract Coin{
	address centralBankAddress;

	mapping(address => uint) balances;
	mapping(address => uint) bonds;
	mapping(address => uint) shares;
	address[] public users;
	uint startingAmount = 100;
	uint constMultiplier = 1000;
	uint startingSharesAmount = 1;
	constructor (address bank_address) public {
		centralBankAddress = bank_address;
	}

	function register() public {
	    bool exists = false;
		for (uint i=0; i<users.length; i++){
		    if (users[i] == msg.sender){
		        exists=true;
		    }
		}
	    if (!exists){
	        users.push(msg.sender);
	        balances[msg.sender] += startingAmount;
	        balances[centralBankAddress] += startingAmount;
                shares[msg.sender] += startingSharesAmount;
	        shares[centralBankAddress] += startingSharesAmount;
	    }
	}
	
	function transferAmount(address _to, uint _amount) public payable{
	    require(_amount <= balances[msg.sender]);
	    balances[msg.sender]-=_amount;
		balances[_to]+=_amount;
	}

	function getBalance(address _user) public view returns (uint){
		return balances[_user];
	}

    function getShareBalance(address _user) public view returns (uint){
		return shares[_user];
	}
	
	function InflateBalance(uint _amount) public{
		//require(msg.sender == centralBankAddress);
		balances[centralBankAddress]+=_amount;
		uint totalShares = shares[centralBankAddress];
		// devide added amount to all users holding shares respectivley
		for (uint i=0; i<users.length; i++){
			if (shares[users[i]] > 0){
				uint new_coins = (constMultiplier * shares[users[i]] / totalShares) * _amount;
				balances[users[i]] += new_coins/constMultiplier;
			}
		}
	}
	
	function produceShare(address _to, uint _amount) public payable{
		//require(msg.sender == centralBankAddress);
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
	
	function getBankAddress() public view returns (address){
		return centralBankAddress;
	}
}
