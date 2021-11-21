const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { parseEther } = ethers.utils;

const TOTAL_SUPPLY = parseEther('1000');

describe("Token", function () {
  before(async function () {
    const accounts = await ethers.getSigners();
    this.deployer = accounts[0];
    this.other = accounts[1];
    this.stranger = accounts[2];
    this.receiver = accounts[3];
    this.BadTokenFactory = await ethers.getContractFactory("BadToken");
  });

  beforeEach(async function () {
    this.token = await this.BadTokenFactory.deploy();
  });

  it("successfully deployed", async function () {
    this.token.deployed();
  });

  it("has a name", async function () {
    expect(await this.token.name()).to.equal("BadToken");
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal("BTN")
  })

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.equal(18);
  });

  it("returns the total amount of tokens", async function () {
    expect(await this.token.totalSupply()).to.equal(TOTAL_SUPPLY);
  })

  it("returns the balance of owner", async function () {
    expect(await this.token.balanceOf(this.deployer.address)).to.equal(TOTAL_SUPPLY);
  });

  describe("Basic transfers", function () {
    beforeEach(async function () {
      this.transferTx = await this.token.transfer(this.other.address, '100')
    })

    it("emits event Transfer", async function () {
      await expect(this.transferTx).to.emit(this.token, "Transfer").withArgs(this.deployer.address, this.other.address, '100')
    })

    it("spender's balance decreased", async function () {
      expect(await this.token.balanceOf(this.deployer.address)).to.equal(TOTAL_SUPPLY.sub('100'))
    })

    it("receiver's balance increased", async function () {
      expect(await this.token.balanceOf(this.other.address)).to.equal('100')
    })

    it("reverts if sender has not enough balance", async function () {
      await expect(this.token.connect(this.stranger).transfer(this.other.address, 1)).to.be.reverted;
    })

    describe("Approve", function () {
      beforeEach(async function () {
        this.approve = await this.token.approve(this.receiver.address, '123')
      })

      it("emits event Approval", async function () {
        await expect(this.approve).to.emit(this.token, "Approval").withArgs(this.deployer.address, this.receiver.address, '123')
      })

      it("allowance to account1", async function () {
        expect(await this.token.allowance(this.deployer.address, this.receiver.address)).to.equal('123')
      })

      describe("transferFrom", function () {
        beforeEach(async function () {
          const balanceBefore = await this.token.balanceOf(this.deployer.address)
          this.transferFrom = await this.token.connect(this.receiver).transferFrom(this.deployer.address, this.receiver.address, '123')
        })

        it("emits event Transfer", async function () {
          await expect(this.transferFrom).to.emit(this.token, "Transfer").withArgs(this.deployer.address, this.receiver.address, '123');
        })

        it("owner allowance to account1", async function () {
          expect(await this.token.allowance(this.deployer.address, this.receiver.address)).to.equal(0)
        })

        it("owner balance after transfer", async function () {
          expect(await this.token.balanceOf(this.deployer.address)).to.equal('999999999999999999777')
        })

        it("reverts if account2 has not enough allowance", async function () {
          transferFrom = this.token.connect(this.stranger).transferFrom(this.deployer.address, this.receiver.address, 1)

          await expect(transferFrom).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
        })
      })
    })
    
  })

});
