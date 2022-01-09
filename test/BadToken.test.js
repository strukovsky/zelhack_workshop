const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { parseEther } = ethers.utils;

const TOTAL_SUPPLY = parseEther('0');

describe("Token", function() {
    before(async function() {
        const accounts = await ethers.getSigners();
        this.deployer = accounts[0];
        this.other = accounts[1];
        this.stranger = accounts[2];
        this.receiver = accounts[3];
        this.BadTokenFactory = await ethers.getContractFactory("BadToken");
    });

    beforeEach(async function() {
        this.token = await this.BadTokenFactory.deploy();
    });

    it("successfully deployed", async function() {
        this.token.deployed();
    });

    it("has a name", async function() {
        expect(await this.token.name()).to.equal("OnBridge Fungible Test Token");
    });

    it("has a symbol", async function() {
        expect(await this.token.symbol()).to.equal("OBFTT")
    })

    it("has 18 decimals", async function() {
        expect(await this.token.decimals()).to.equal(18);
    });

    it("returns the total amount of tokens", async function() {
        expect(await this.token.totalSupply()).to.equal(TOTAL_SUPPLY);
    })

    it("returns the balance of owner", async function() {
        expect(await this.token.balanceOf(this.deployer.address)).to.equal(TOTAL_SUPPLY);
    });

    describe("Basic transfers", function() {

        it("emits event Reverted", async function() {
            transfer = this.token.transfer(this.other.address, '100')
            await expect(transfer).to.be.revertedWith("ERC20: transfer amount exceeds balance")
        })

        it("spender's balance decreased", async function() {
            expect(await this.token.balanceOf(this.deployer.address)).to.equal(0)
        })

        it("receiver's balance increased", async function() {
            expect(await this.token.balanceOf(this.other.address)).to.equal(0)
        })

        it("reverts if sender has not enough balance", async function() {
            await expect(this.token.connect(this.stranger).transfer(this.other.address, 1)).to.be.reverted;
        })

        describe("Approve", function() {
            beforeEach(async function() {
                this.approve = await this.token.approve(this.receiver.address, '123')
            })

            it("emits event Approval", async function() {
                await expect(this.approve).to.emit(this.token, "Approval").withArgs(this.deployer.address, this.receiver.address, '123')
            })

            it("allowance to account1", async function() {
                expect(await this.token.allowance(this.deployer.address, this.receiver.address)).to.equal('123')
            })

            describe("TransferFrom", function() {

                it("owner allowance to account1", async function() {
                    expect(await this.token.allowance(this.deployer.address, this.receiver.address)).to.equal('123')
                })

                it("owner balance after transfer", async function() {
                    expect(await this.token.balanceOf(this.deployer.address)).to.equal('0')
                })

                it("reverts if account2 has not enough allowance", async function() {
                    transferFrom = this.token.connect(this.stranger).transferFrom(this.deployer.address, this.receiver.address, 1)

                    await expect(transferFrom).to.be.revertedWith("ERC20: transfer amount exceeds balance")
                })
            })
        })

    })

    describe("Mintable properties", function() {
        it("can be mintable", async function() {
            expect(await this.token.mint(100))
        })

        describe("Minting can be reached by everyone", function() {
            beforeEach(async function() {
                await this.token.connect(this.other).mint(100)
            })

            it("minting changes other's balance", async function() {
                expect(await this.token.balanceOf(this.other.address)).to.equal(100)

            })

            it("minted tokens can be sent", async function() {
                expect(await this.token.connect(this.other).transfer(this.deployer.address, 50)).
                to.emit(this.token, "Transfer").
                withArgs(this.other.address, this.deployer.address, 50)
            })

            it("minted tokens can be approved", async function() {
                expect(await this.token.approve(this.other.address, 50))
                    .to.emit(this.token, "Approval")
                    .withArgs(this.deployer.address, this.other.address, 50)
            })

            describe("Minted tokens can be used in transferFrom()", function() {
                beforeEach(async function() {
                    await this.token.mint(100)
                    await this.token.approve(this.other.address, 50)
                })
                it("minted approved tokens can be get by allowance", async function() {

                    expect(await this.token.allowance(this.deployer.address, this.other.address)).to.equals(50)
                })

                it("minted tokens can be sent", async function() {
                    await expect(this.token.connect(this.other).transferFrom(this.deployer.address, this.other.address, 20))
                        .to.emit(this.token, "Transfer")
                        .withArgs(this.deployer.address, this.other.address, 20)
                })

            })
        })
    })

});