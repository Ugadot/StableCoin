// Contracts
const Bank = artifacts.require("CentralBank")
const Coin = artifacts.require("Coin")

const delay = require("delay")

//for(let i = 0; i < 10; i++) {
//  await delay(10000).then(async () => {
//      await instance.increaseCount({ from: account })
//  })
//  let i = await instance.i.call()
//  console.log(new Date().getTime(), i.toNumber())
//}


// Utils
const transfer_money = async (account_number, accounts, coin_conract) => {
  var random_num = web3.utils.hexToNumber(web3.utils.randomHex(1));
  if (random_num <= 10)
  {
	  var my_balance = await coin_conract.getBalance({from: accounts[account_number]});
	  var amount_to_transfer = Math.round(my_balance / web3.utils.hexToNumber(web3.utils.randomHex(1)));
	  if (amount_to_transfer < 1)
	  {
		  return 0;
	  }
	  var acount_to_transfer = account_number;
	  while (acount_to_transfer == account_number || acount_to_transfer < 0 || acount_to_transfer > 9)
	  {
		  acount_to_transfer = Math.round(web3.utils.hexToNumber(web3.utils.randomHex(1)) / 25) - 1;
	  }
	 await coin_conract.transferAmount(accounts[acount_to_transfer], amount_to_transfer, { from: accounts[account_number] });
	 console.log('Transfered ', amount_to_transfer ,' from account ', account_number, ' to account ', acount_to_transfer);
	 return amount_to_transfer;

  }
  return 0;
}


const playRationaly = async (account_address, bank_conract, coin_conract) => {
  
  // Get C2D ratio from bank
  var ratio = await bank_conract.getC2D();
  
  if (ratio < 100)
  {
	  var have_auctioned = await coin_contract.isInAuction({from: account_address});   // Check if already applied for auction
	  
	  if (have_auctioned == false)
	  {
		  var bond_to_money_ratio = 0.2;   // TODO: Maybe apply smarter ratio function? (risk factor + random noise?)
		  
		  var single_bond_price = (web3.utils.hexToNumber(web3.utils.randomHex(1)) / 255) * 0.8 + 0.19;   // Shold be between 0.19 to 0.99
		  
		  var my_balance = await coin_conract.getBalance({from: account_address});
		  var affordable_money = bond_to_money_ratio * my_balance;
		  
		  var bond_asking_amount = Math.round(affordable_money / single_bond_price);
		  var bond_on_sale = await coin_conract.getBondsOnAuction();
			
		  if (bond_asking_amount > bond_on_sale)
		  {
			  bond_asking_amount = bond_on_sale;
		  }

		  await coin_contract.applyForAuction(bond_asking_amount, single_bond_price, {from: account_address});
		  return wanted_bonds;
	  }
  }
  return 0;
}



// --------------------------------------------------

module.exports = async function(callback) {
	console.log('Starting 10 accounts script')
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()
		
		
		// Fetch the deployed bank and coin
		const coin = await Coin.deployed()
		const bank = await Bank.deployed()
		console.log('Bank fetched', bank.address)
		console.log('Coin fetched', coin.address)
		
		var c_addr = await bank.getCoinAddress();
		//console.log('Bank coin address is: ', c_addr);
		
		//await bank.setCoin(coin.address);
		await bank.setCoin(coin.address);
		var c_addr = await bank.getCoinAddress();
		//console.log('Bank coin address is: ', c_addr);
		
		var b_addr = await coin.getBankAddress();
		//console.log('Coin bank address is: ', b_addr);
		
		var account_address;
		var balance;
		var bonds;
		
		// Register all acounts
		for(let i = 0; i < 10; i++) {
			account_address = accounts[i];
			await coin.register({ from: account_address });
			balance = await coin.getBalance({ from: account_address });
			console.log('Account ', i ,' balance is: ', Number(balance));
		}
		
		var money_transferrd = 0;
		while (1)
		{
			// Randomly transfer money
			money_transferrd = 0;
			// Conduct transfer of money
			for(let i = 0; i < 10; i++) {
				money_transferrd = money_transferrd + await transfer_money(i, accounts, coin);
			}
			if (money_transferrd > 0)
			{
				for(let i = 0; i < 10; i++) {
					account_address = accounts[i];
					balance = await coin.getBalance({from: account_address});
					console.log('Account ', i ,' balance is: ', Number(balance));
				}
			}
			var bonds = 0;
			// Play rationaly with C2D (bonds + shares management)
			for(let i = 0; i < 10; i++) 
			{
				 account_address = accounts[i];
				 bonds = await playRationaly(account_address, bank, coin);
				// if (bonds != 0 )
				// {
				// 	 console.log('Account ', i ,' bought ', Number(bonds), ' bonds');
				// }
			}
			var result = coin.conductAuction();
			if (result == 1)
			{
				console.log('Auction Result');
				for(let i = 0; i < 10; i++) {
					account_address = accounts[i];
					balance = await coin.getBalance({from: account_address});
					console.log('Account ', i ,' balance is: ', Number(balance));
					bonds = await coin.getBonds({from: account_address});
					console.log('Account ', i ,' bonds is: ', Number(bonds));
				}
			}
			
			await delay(10000);
		}
	}
	catch(error) {
		console.log(error)
	}
	
	callback();
}


