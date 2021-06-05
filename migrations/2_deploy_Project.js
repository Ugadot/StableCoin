const Coin = artifacts.require("./Coin.sol");
const CentralBank = artifacts.require("./CentralBank.sol");


module.exports = async function (deployer) {
  deployer.deploy(CentralBank).then( function() {
	return deployer.deploy(Coin, CentralBank.address);
  });
  const instance = await CentralBank.deployed();
  instance.setCoin(Coin.address);
  //CentralBank.SetCoin(Coin.address);
};
