// Contracts
const Bank = artifacts.require("CentralBank")
const Coin = artifacts.require("Coin")
const Oracle = artifacts.require("Oracle")


module.exports = async function(callback) {
	console.log('Start current script')
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()
		
		// Fetch the deployed bank and coin
		const coin = await Coin.deployed()
		const bank = await Bank.deployed()
		const oracle = await Oracle.deployed()
		console.log('Bank fetched', bank.address)
		console.log('Coin fetched', coin.address)
		console.log('Oracle fetched', oracle.address)
		
		var c_addr = await bank.getCoinAddress();
		var o_addr = await bank.getOracleAddress();
		console.log('Bank coin address is: ', c_addr);
		console.log('Bank oracle address is: ', o_addr);
		
		await bank.setCoin(coin.address);
		var c_addr = await bank.getCoinAddress();
		console.log('Bank coin address is: ', c_addr);
		
		var b_addr = await coin.getBankAddress();
		console.log('Coin bank address is: ', b_addr);
		
		await bank.setOracle(oracle.address);
		var o_addr = await bank.getOracleAddress();
		console.log('Bank oracle address is: ', o_addr);
		
		// Register first user
		const account_one = accounts[0];
		await coin.register({ from: account_one });
		var balance = await coin.getBalance(account_one);
		console.log('Account 1 balance is: ', Number(balance));
		
		//produce shares to account 1
		//await coin.produceShare(account_one, 100);
		var shares = await coin.getShareBalance(account_one);
		console.log('Account 1 shares is: ', Number(shares));
		
		// Register first user
		const account_two = accounts[1];
		await coin.register({ from: account_two });
		balance = await coin.getBalance(account_two);
		console.log('Account 2 balance is: ', Number(balance));
		
		//produce shares to account 1
		//await coin.produceShare(account_one, 100);
		shares = await coin.getShareBalance(account_two);
		console.log('Account 2 shares is: ', Number(shares));
		
		console.log('\n\nTransfering Money......\n\n');

		//Transfer coins from account 1 to account 2
		await coin.transferAmount(account_two, 50, { from: account_one });
		//Print new balance
		balance = await coin.getBalance(account_one);
		console.log('Account 1 balance is: ', Number(balance));
		balance = await coin.getBalance(account_two);
		console.log('Account 2 balance is: ', Number(balance));
		
		
		console.log('\n\nUpdating C2D......');
		await bank.updateC2D();
		var c2d = await bank.getC2D();
		// while (c2d < 100)
		// {
			// await bank.updateC2D();
			// c2d = await bank.getC2D();
		// }
		console.log('New C2D is ', Number(c2d));
		console.log('\nNew Accounts balances is:');
		//Print new balance
		balance = await coin.getBalance(account_one);
		console.log('Account 1 balance is: ', Number(balance));
		balance = await coin.getBalance(account_two);
		console.log('Account 2 balance is: ', Number(balance));
	
	}
	catch(error) {
		console.log(error)
	}
	
	callback();
}


