const Oracle = artifacts.require("Oracle");
const Coin = artifacts.require("Coin");
const CentralBank = artifacts.require("CentralBank");

module.exports = async function (deployer) {
  deployer.deploy(CentralBank).then( function() {
	deployer.deploy(Oracle, { value: "1000000000000000000" });
	return deployer.deploy(Coin, CentralBank.address);
  });
};
