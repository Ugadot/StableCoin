const Coin = artifacts.require("Coin");
const CentralBank = artifacts.require("CentralBank");


module.exports = async function (deployer) {
  deployer.deploy(CentralBank).then( function() {
	return deployer.deploy(Coin, CentralBank.address);
  });
  //const instance = await CentralBank.deployed();
  //instance.setCoin(Coin.address);
  //CentralBank.SetCoin(Coin.address);
};
