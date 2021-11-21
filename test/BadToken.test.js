const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("Token", function () {
  before(async function () {
    const accounts = await ethers.getSigners();
    this.deployer = accounts[0];
    this.BadTokenFactory = await ethers.getContractFactory("BadToken");
  });

  beforeEach(async function () {
    this.token = await this.BadTokenFactory.deploy();
  });

  it("successfully deployed", async function () {
    this.token.deployed();
  });
});
