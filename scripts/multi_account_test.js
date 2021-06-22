const fetch = require('node-fetch');
const readline = require('readline');
var readlineSync = require('readline-sync');

// var rl = readline.createInterface({
  // input: process.stdin,
  // output: process.stdout
// });


// Contracts
const Bank = artifacts.require("CentralBank")
const Coin = artifacts.require("Coin")
const Oracle = artifacts.require("Oracle")

const delay = require("delay")

const coinUnit = 100;
const bondUnit = 1;

var totalAmount;

//for(let i = 0; i < 10; i++) {
//  await delay(10000).then(async () => {
//      await instance.increaseCount({ from: account })
//  })
//  let i = await instance.i.call()
//  console.log(new Date().getTime(), i.toNumber())
//}


// Utils
const transfer_money = async (account_number, accounts, coin_contract) => {
  var random_num = web3.utils.hexToNumber(web3.utils.randomHex(1));
  if (random_num <= 10)
  {
	  var my_balance = await coin_contract.getBalance({from: accounts[account_number]});
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
	 await coin_contract.transferAmount(accounts[acount_to_transfer], amount_to_transfer, { from: accounts[account_number] });
	 console.log('Transfered ', amount_to_transfer/coinUnit ,' from account ', account_number, ' to account ', acount_to_transfer);
	 return amount_to_transfer;

  }
  return 0;
}


const playRationaly = async (account_address, bank_conract, coin_contract) => {
  
  //console.log("playRationaly: ", account_address);
  // Get C2D ratio from bank
  var ratio = await bank_conract.getC2D();
  //console.log("ratio is: ", Number(ratio/coinUnit));
  if (ratio < coinUnit)
  {
	  var have_auctioned = await coin_contract.isInAuction({from: account_address});   // Check if already applied for auction
	  
	  if (have_auctioned == false)
	  {
		  var bond_to_money_ratio = 0.2;   // TODO: Maybe apply smarter ratio function? (risk factor + random noise?)
		  
		  var single_bond_price = Math.round((coinUnit/bondUnit) * ((web3.utils.hexToNumber(web3.utils.randomHex(1)) / 255) * 0.8 + 0.19));   // Should be between coinUnit*(0.19 to 0.99)
		  
		  var my_balance = await coin_contract.getBalance({from: account_address});
		  var affordable_money = bond_to_money_ratio * my_balance;
		  
		  var bond_asking_amount = Math.round(affordable_money / single_bond_price);
		  var bond_on_sale = await coin_contract.getBondsOnAuction();
			
		  if (bond_asking_amount > bond_on_sale)
		  {
			  bond_asking_amount = bond_on_sale;
		  }
			
		  //console.log("user: ", account_address, " applied for :", Number(bond_asking_amount), " bonds, with price: ", Number(single_bond_price/coinUnit));

		  await coin_contract.applyForAuction(bond_asking_amount, single_bond_price, {from: account_address});
		  //await coin_contract.applyForAuction(1, single_bond_price, {from: account_address});
		  return bond_asking_amount;
	  }
  }
  return 0;
}

const getAmount = async () => {
	var _amount = readlineSync.question('enter wanted amount of total coins: ');
	if (_amount != ""){
		totalAmount = _amount;
	}
	console.log('Amount is: ' + totalAmount);
	 // await rl.question('enter wanted amount of total coins: ', (amount) => {
		// console.log('Amount is: ' + amount);
		// totalAmount = amount;
	 // });
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
		const oracle = await Oracle.deployed()

		//console.log('Price Is:', oracle.update());
		// int price = oracle.update();
		// var price = httpGet("https://blockchain.info/tobtc?currency=USD&value=50000000");
		// console.log('Price = ', price);
		// fetch('https://blockchain.info/ticker')
		// .then(response => response.json())
		// .then(data => console.log(data.USD.last));
		
		console.log('Bank fetched', bank.address)
		console.log('Coin fetched', coin.address)
		console.log('Oracle fetched', oracle.address)

		var c_addr = await bank.getCoinAddress();
		var o_addr = await bank.getOracleAddress();

		//console.log('Bank coin address is: ', c_addr);
		
		//await bank.setCoin(coin.address);
		await bank.setCoin(coin.address);
		var c_addr = await bank.getCoinAddress();
		//console.log('Bank coin address is: ', c_addr);
		
		await bank.setOracle(oracle.address);
		var o_addr = await bank.getOracleAddress();
		
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
			//console.log('Account ', i ,' balance is: ', Number(balance/coinUnit));
			console.log('[Balance] ', i , ' ', Number(balance/coinUnit));
		}
		

		var money_transferrd = 0;
		var counter = 0;
		while (1)
		{
			// update oracle's ratio
			if (counter %10 == 0)
			{
				getAmount();	
			}
			// const response = await fetch('https://blockchain.info/ticker');
			// var data = await response.json();
			// console.log("ratio is: ", Number((data.USD.last / 50)));
			// await oracle.update(Math.floor(Number((data.USD.last / 50)) * coinUnit));
			await oracle.update(totalAmount * coinUnit);

			// console.log("enter wanted amount of total coins \n");
			// rl.on('line', function(line){
				// console.log(line);
			// })
			// var ourRatio = readline();
			// if (ourRatio != ""){
				// await oracle.update(ourRatio * coinUnit);
			// }
			// .then(response => response.json())
			// .then(data => oracle.update(Math.floor((Number(data.USD.last)))))
			// .then(data => console.log("ratio is: ", Number(data.USD.last * 10)));
			
			// Randomly transfer money
			money_transferrd = 0;
			// Conduct transfer of money
			for(let i = 0; i < 10; i++) {
				money_transferrd = money_transferrd + await transfer_money(i, accounts, coin);
				//console.log('Account ', i ,' money transfer: ', Number(money_transferrd));
			}
			if (money_transferrd > 0)
			{
				for(let i = 0; i < 10; i++) {
					account_address = accounts[i];
					balance = await coin.getBalance({from: account_address});
					//console.log('Account ', i ,' balance is: ', Number(balance/coinUnit));
					console.log('[Balance] ', i , ' ', Number(balance/coinUnit));
				}
			}
			var bonds = 0;
			// Play rationaly with C2D (bonds + shares management)
			// first, update C2D ratio
			await bank.updateC2D();
			
			var ratio = await bank.getC2D();
			console.log("[Ratio] ", Date.now(), ' ', Number(ratio/coinUnit));

			for(let i = 0; i < 10; i++) 
			{
				 account_address = accounts[i];
				 bonds = await playRationaly(account_address, bank, coin);
				// if (bonds != 0 )
				// {
				// 	 console.log('Account ', i ,' bought ', Number(bonds), ' bonds');
				// }
			}
			await coin.conductAuction();
			console.log('Auction Result');
			for(let i = 0; i < 10; i++) {
				account_address = accounts[i];
				balance = await coin.getBalance({from: account_address});
				//console.log('Account ', i ,' balance is: ', Number(balance/coinUnit));
				console.log('[Balance] ', i , ' ', Number(balance/coinUnit));
				bonds = await coin.getBonds({from: account_address});
				//console.log('Account ', i ,' bonds is: ', Number(bonds));
				console.log('[Bond] ', i , ' ', Number(bonds));
			}
			counter += 1;
			//await delay(1000);
		}
	}
	catch(error) {	
		console.log(error)
	}
	
	callback();
}


