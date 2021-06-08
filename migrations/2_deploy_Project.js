const Oracle = artifacts.require("Oracle");
const Coin = artifacts.require("Coin");
const CentralBank = artifacts.require("CentralBank");

module.exports = async function (deployer) {
  deployer.deploy(CentralBank).then( function() {
	deployer.deploy(Oracle);
	return deployer.deploy(Coin, CentralBank.address);
  });
  // const bank_instance = await CentralBank.deployed();
  // const coin_instance = await Coin.deployed();
  // const oracle_instance = await Oracle.deployed();
  // bank_instance.setCoin(coin_instance.address);
  // bank_instance.setOracle(oracle_instance.address);
  // CentralBank.SetCoin(Coin.address);
};
