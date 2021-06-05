// Contracts
const Bank = artifacts.require("CentralBank")
const Coin = artifacts.require("Coin")


module.exports = async function(callback) {
	console.log('Start current script')
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()
		
		// Fetch the deployed bank and coin
		const coin = await Coin.deployed()
		const bank = await Bank.deployed()
		console.log('Bank fetched', bank.address)
		console.log('Coin fetched', coin.address)
		
		var c_addr = await bank.getCoinAddress();
		console.log('Bank coin address is: ', c_addr);
		
		//await bank.setCoin(coin.address);
		await bank.setCoin(coin.address);
		var c_addr = await bank.getCoinAddress();
		console.log('Bank coin address is: ', c_addr);
		
		var b_addr = await coin.getBankAddress();
		console.log('Coin bank address is: ', b_addr);
		
		// Register first user
		const account_one = accounts[0];
		await coin.register({ from: account_one });
		const balance = await coin.getBalance(account_one);
		console.log('Account 1 balance is: ', balance);
		
		//produce shares to account 1
		await coin.produceShare(account_one, 100);
		const shares = await coin.getShareBalance(account_one);
		console.log('Account 1 shares is: ', shares);
	}
	catch(error) {
		console.log(error)
	}
	
	callback();
}


