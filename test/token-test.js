const { expect } = require("chai");

describe("Token contract", function () {

    let Token, mockToken, owner, addr1, addr2, addrs;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("MockToken");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        mockToken = await Token.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await mockToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await mockToken.balanceOf(owner.address);
            expect(await mockToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            await mockToken.transfer(addr1.address, 50);
            const addr1Balance = await mockToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await mockToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await mockToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await mockToken.balanceOf(owner.address);

            await expect(
                mockToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWith("transfer amount exceeds balance");

            expect(await mockToken.balanceOf(owner.address)).to.equal(
                initialOwnerBalance
            );
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await mockToken.balanceOf(owner.address);

            await mockToken.transfer(addr1.address, 100);
            await mockToken.transfer(addr2.address, 50);

            const finalOwnerBalance = await mockToken.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

            const addr1Balance = await mockToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await mockToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });
});
