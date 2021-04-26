// This script will deploy smart contracts for testing on local hardhat ethereum node
const hre = require("hardhat");

async function main() {
    let STAKING_PERIOD = 86400
    await hre.run('compile');

    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const tokenContract = await MockToken.deploy();
    await tokenContract.deployed();
    console.log("Mock token for testing deployed to:", tokenContract.address);

    const StakingContract = await hre.ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(tokenContract.address, STAKING_PERIOD);
    await stakingContract.deployed();
    console.log("Staking deployed to:", stakingContract.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
