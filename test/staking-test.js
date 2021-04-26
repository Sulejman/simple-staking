const {expect} = require("chai");

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

describe("Staking contract", function () {

    let Token, Staking, mockToken, stakingContract, owner, addrs;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("MockToken");
        [owner, ...addrs] = await ethers.getSigners();
        mockToken = await Token.deploy();

        Staking = await ethers.getContractFactory("StakingContract");
        // Deploying Staking contract with period of 5 seconds just to make testing more convenient
        stakingContract = await Staking.deploy(mockToken.address, 5);
    });

    describe("Staking", function () {

        // Increasing mocha timeout here in order to properly simulate waiting for blocks to be mined and time pasing
        this.timeout(240 * 1000);

        it("Should stake 10 mockTokens", async function () {
            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(0);

            await mockToken.increaseAllowance(stakingContract.address, 10);
            await stakingContract.stake(10);
            await sleep(6);

            /*
             Increasing allowance isn't doing anything special here,
             but we need new block produced in order for next function to work properly,
             and because we are testing on local network nothing else produces new transactions to be included in blocks.
             */
            mockToken.increaseAllowance(stakingContract.address, 10);

            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(10);
        })

        it("Should unstake 10 mockTokens", async function () {
            await mockToken.increaseAllowance(stakingContract.address, 10);
            await stakingContract.stake(10);
            mockToken.increaseAllowance(stakingContract.address, 10);

            await stakingContract.release(10);
            expect(await stakingContract.viewStakedAmount(owner.address)).to.equal(0);
        })

        it("Should return correct number of staking points each time", async function () {
            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(0);
            expect(await stakingContract.viewStakedAmount(owner.address)).to.equal(0);
            await mockToken.increaseAllowance(stakingContract.address, 20);
            await stakingContract.stake(20);

            await sleep(6);
            mockToken.increaseAllowance(stakingContract.address, 10);
            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(20);


            await sleep(6);
            mockToken.increaseAllowance(stakingContract.address, 10);
            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(40);

            await stakingContract.release(10);
            await sleep(6);
            mockToken.increaseAllowance(stakingContract.address, 10);
            expect(await stakingContract.viewStakingPoints(owner.address)).to.equal(50);
        })
    });
});
