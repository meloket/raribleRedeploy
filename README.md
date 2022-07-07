## Install environment.

Change **.env.example** to **.env**.

Sing In **https://www.alchemy.com/** to get **API_URL_MUMBAI** and **API_URL_POLYGON** for deploying contracts.

Sign In **https://polygonscan.com/** to get **POLYGON_API_KEY** for verification of contracts.

Add private key and public key to sign the deployment transactions.


Install node modules.

```bash
yarn

yarn bootstrap
```

## Deploy on test network.

```bash
yarn testnet
```

## Deploy to main net.

```bash
yarn mainnet
```
