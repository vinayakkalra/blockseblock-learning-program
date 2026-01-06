# UUPS Hardhat Demo

This workspace contains:
- `UUPSLogicV1.sol` - your provided UUPS implementation
- `UUPSProxy.sol` - a simple ERC1967 proxy
- `UUPSLogicV2.sol` - a small upgradeable V2 used for tests

Quick setup:

1. Install dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts @openzeppelin/contracts-upgradeable
```

2. Compile

```bash
npm run compile
```

3. Run tests

```bash
npm test
```

4. Deploy locally (script deploys logic & proxy and shows initial value)

```bash
npm run deploy
```

5. Upgrade a deployed proxy (set PROXY env var to the address printed by deploy)

```bash
PROXY=<proxy-address> npm run upgrade
```

Notes:
- Tests validate ownership, upgrade authorization, and that V2's `increment()` works after upgrade.
- No modifications were made to your original `UUPSLogicV1.sol` and `UUPSProxy.sol` files.
