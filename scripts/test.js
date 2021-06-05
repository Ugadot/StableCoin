const Coin = artifacts.require("Coin");
const Bank = artifacts.require("CentralBank");

contract("My first test", async accounts => {
  it("Register first User", async () => {

    const bank = await Bank.deployed();
	const coin = await Coin.deployed();

	let result = await bank.setCoin.call(coin.address);
	var c_addr = await bank.getCoinAddress();
		
    //console.log("Coin address setted in CentralBank:");
    //console.log(coin.address)
    //console.log("Returned address from Bank:");
    //console.log(c_addr)
    //assert.equal(c_addr, coin.address);
	
	const account_one = accounts[0];
    coin.register({ from: account_one });
    var balance = await coin.getBalance(account_one);
    assert.equal(balance, 100);
      
	//produce shares to account 1
	coin.produceShare(account_one, 100, {from: bank.address});
	var shares = await coin.getShareBalance(account_one);
    assert.equal(shares, 100);
  });
});

