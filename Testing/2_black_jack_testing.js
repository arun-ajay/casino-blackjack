const BlackJack = artifacts.require('./BlackJack_testing');

module.exports = function (deployer) {
  deployer.deploy(BlackJack);
};