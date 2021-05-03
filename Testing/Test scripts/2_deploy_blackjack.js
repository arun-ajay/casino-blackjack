const BlackJack_testing = artifacts.require('./BlackJack_testing');

module.exports = function (deployer) {
  deployer.deploy(BlackJack_testing);
};
