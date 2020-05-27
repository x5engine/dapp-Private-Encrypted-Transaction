var PrivateMemoryBook = artifacts.require("PrivateMemoryBook");
var Arg = "This is a Private Hello Azure Blockchain! thanks to Tessera";
module.exports = deployer => {
    deployer.deploy(PrivateMemoryBook, Arg, { privateFor: ["llGj6iwxark5ULgJ7vh1x6mmrI8KeDbFpd28xCg1YFk="] });
};