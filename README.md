#Simple Staking Contract

Prepare environment:
```aidl
npm install -g npx
npm install
```

Run local ethereum network for testing:

```aidl
npx hardhat node
```

And, in another terminal run tests:
```aidl
npx hardhat test
```
Tests should show a bit of longer times but it is only due to the fact that we have to wait for some time to pass to test this contract since it's time bound.

If you wish to deploy in local node for manual testing you can use:

```aidl
npx hardhat run --network localhost scripts/deploy-hre.js
```
