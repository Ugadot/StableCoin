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
  if (random_num <= 20)
  {
	  //console.log('HERE');

	  var my_balance = await coin_conract.getBalance(accounts[account_number]);
	  //console.log('HERE_1');
	  var amount_to_transfer = Math.round(my_balance / web3.utils.hexToNumber(web3.utils.randomHex(1)));
	  if (amount_to_transfer < 1)
	  {
		  return 0;
	  }
	  //console.log('HERE_2');
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
		
		var account_num;
		var balance;
		
		// Register all acounts
		for(let i = 0; i < 10; i++) {
			account_num = accounts[i];
			await coin.register({ from: account_num });
			balance = await coin.getBalance(account_num);
			console.log('Account ', i ,' balance is: ', Number(balance));
		}
		
		var money_transferrd = 0;
		while (1)
		{
			money_transferrd = 0;
			// Conduct transfer of money
			for(let i = 0; i < 10; i++) {
				money_transferrd = money_transferrd + await transfer_money(i, accounts, coin);
			}
			if (money_transferrd > 0)
			{
				for(let i = 0; i < 10; i++) {
					account_num = accounts[i];
					balance = await coin.getBalance(account_num);
					console.log('Account ', i ,' balance is: ', Number(balance));
				}
			}
			await delay(5000);
		}
		
	
	}
	catch(error) {
		console.log(error)
	}
	
	callback();
}


