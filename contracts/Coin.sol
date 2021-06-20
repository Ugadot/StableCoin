pragma solidity ^0.5.0;

contract Coin{

	uint constant coinUnit = 1000000; // amount of mini-units in one coin (needed because there's no float in solidity)
	uint constant bondUnit = 1000; // amount of bonds in one unit (needed because there's no float in solidity)
	address centralBankAddress;
	mapping(address => uint) balances;
	mapping(address => uint) bonds;
	mapping(address => uint) shares;
	address[] public users;
	uint constant startingAmount = 100 * coinUnit;
	uint constant constMultiplier = 1000;
	uint constant startingSharesAmount = 1;
	uint constant bondsToSell = 30;
	mapping(address => bool) isInAuctionMapping;
	mapping(address => uint) auctionAmount;
	mapping(address => uint) auctionPrice;
	mapping(uint => uint) auctionDivisionOrder;
	uint currentAuctionBonds;
	
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
	
	function transferAmount(address _to, uint _amount) public payable {
	    require(_amount <= balances[msg.sender]);
	    balances[msg.sender]-=_amount;
		balances[_to]+=_amount;
	}

	function getBalance() public view returns (uint) {
		return balances[msg.sender];
	}

    function getShareBalance() public view returns (uint) {
		return shares[msg.sender];
	}
	
	function getBonds() public view returns (uint) {
		return bonds[msg.sender];
	}
	
	function InflateBalance(uint _amount) public {
		require(msg.sender == centralBankAddress);
		balances[centralBankAddress]+=_amount;
		uint totalShares = shares[centralBankAddress];
		uint amountLeft = _amount;
		uint bondsToSellToUser;
		// firstly, convert bonds into coins
		// the bank redeems bonds, but fairly (divide with all users)
		for (uint i=0; i<users.length; i++){
			bondsToSellToUser = 0;
			if (amountLeft > bondsToSell * (coinUnit/bondUnit)){
				// can sell <bondsToSell> amount
				if(bonds[users[i]] > bondsToSell){
					// can sell <bondsToSell> amount
					bondsToSellToUser = bondsToSell;
				} else {
					// can sell only <bonds[users[i]]> amount
					bondsToSellToUser = bonds[users[i]];
				}
			} else {
				// can sell only <amountLeft/coinUnit> amount
				if(bonds[users[i]] > amountLeft/(coinUnit/bondUnit)){
					// can sell <bondsToSell> amount
					bondsToSellToUser = amountLeft/(coinUnit/bondUnit);
				} else {
					// can sell only <bonds[users[i]]> amount
					bondsToSellToUser = bonds[users[i]];
				}
			}
			balances[users[i]] += (coinUnit/bondUnit) * bondsToSellToUser;
			balances[centralBankAddress] += (coinUnit/bondUnit) * bondsToSellToUser;
			bonds[users[i]] -= bondsToSellToUser;
			bonds[centralBankAddress] -= bondsToSellToUser;
			
			amountLeft -= (coinUnit/bondUnit) * bondsToSellToUser;
		}
		
		if(bonds[centralBankAddress] == 0){
			// now, if there are no bonds at all, devide added amount to all users holding shares respectivley
			for (uint i=0; i<users.length; i++){
				if (shares[users[i]] > 0){
					uint new_coins = (constMultiplier * shares[users[i]] / totalShares) * _amount;
					balances[users[i]] += new_coins/constMultiplier;
				}
			}
		}
	}
	
	function produceShare(address _to, uint _amount) public payable {
		//require(msg.sender == centralBankAddress);
		shares[centralBankAddress]+=_amount;
		shares[_to]+=_amount;
	}
	
	function getBankAddress() public view returns (address) {
		return centralBankAddress;
	}
	
	
	//  *** Auction Functions ***
	
	
	function initAuction(uint bonds_amount) public {
		currentAuctionBonds = bonds_amount;
		// reset all auction details
		for (uint i=0; i<users.length; i++){
			isInAuctionMapping[users[i]] = false;
			auctionAmount[users[i]] = 0;
			auctionPrice[users[i]] = 0;
		}
	}
	
	function getBondsOnAuction() public view returns (uint) {
		return currentAuctionBonds;
	}
	
	function isInAuction() public view returns (bool) {
		return isInAuctionMapping[msg.sender];
	}
	
	function applyForAuction(uint bonds_amount, uint price) public {
		require(balances[msg.sender] >= bonds_amount * price);
		auctionAmount[msg.sender] = bonds_amount;
		auctionPrice[msg.sender] = price;
	}
	
	function conductAuction() public {
		uint current_max_price = 0;
		uint current_max_user = 0;
		uint current_amount = 0;
		uint total_users_amount = 0;
		uint clearing_price = coinUnit;
		uint round = 0;
		
		if(currentAuctionBonds == 0) return;
		
		for (uint i=0; i<users.length; i++){
			total_users_amount += auctionAmount[users[i]];
		}
		if (total_users_amount < currentAuctionBonds){
			// not enough offers.
			// give all users their asked amount for the clearing price, which is the minimum offer.
			for (uint i=0; i<users.length; i++){
				if(auctionPrice[users[i]] < clearing_price){
					clearing_price = auctionPrice[users[i]];
				}
				// set the order of division
				auctionDivisionOrder[i] = i;
			}
		}
		else{
		// we have enough offers --> need to find the clearing price.
			while(current_amount < currentAuctionBonds){
				 
				// reset params before each iterations
				current_max_price = 0;
				current_max_user = 0;
				for (uint i=0; i<users.length; i++){
					if(auctionPrice[users[i]] > current_max_price){
						current_max_price = auctionPrice[users[i]];
						current_max_user = i;
					}
				}
				// found the current max price
				current_amount += auctionAmount[users[current_max_user]];
				clearing_price = current_max_price;
				// set the order of division
				auctionDivisionOrder[round] = current_max_user;
				round += 1;
				auctionPrice[users[current_max_user]] = 0; // so this user won't be the max again
			}
		}
		// now, in both cases above, we have here the correct clearing price.
		// let's divide the bonds by the division order
		round = 0;
		current_amount = 0;
		uint current_user_idx = 0;
		while(current_amount < currentAuctionBonds){
			current_user_idx = auctionDivisionOrder[round];
			uint user_amount = auctionAmount[users[current_user_idx]];
			if (current_amount + user_amount > currentAuctionBonds){
				user_amount = currentAuctionBonds - current_amount; // cannot supply the user his requested amount. 
			}
			
			bonds[users[current_user_idx]] += user_amount;
			bonds[centralBankAddress] += user_amount;
			balances[users[current_user_idx]] -= clearing_price * user_amount;
			balances[centralBankAddress] -= clearing_price * user_amount;
			current_amount += user_amount;
			round += 1;
			if(round == users.length) break;
		}
		
		initAuction(currentAuctionBonds - current_amount); // call auction with the bonds left (also if there are no bonds left).
	}
	
}
