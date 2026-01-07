# QuickStarter Frontend

A modern, responsive React frontend for the QuickStarter decentralized crowdfunding DApp built on Ethereum.

## Features

- 🔗 **MetaMask Integration** - Connect and manage your Ethereum wallet
- 🌐 **Multi-Network Support** - Works with Hardhat localhost and Sepolia testnet
- 🚀 **Create Projects** - Launch crowdfunding campaigns with funding goals
- 💰 **Invest in Projects** - Support projects with ETH investments
- 💸 **Withdraw Funds** - Project owners can withdraw raised funds
- 📊 **Real-time Updates** - Live project progress and investment tracking
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔔 **Toast Notifications** - User-friendly transaction feedback

## Tech Stack

- **React 18** with Vite for fast development
- **ethers.js v6** for Ethereum blockchain interaction
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** browser extension
3. **QuickStarter smart contract** deployed on your target network

## Installation

1. **Clone and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the contract:**
   
   Update `src/constants/contract.js` with your deployed contract address:
   ```javascript
   export const CONTRACT_CONFIG = {
     address: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // Replace this
     // ... rest of config
   };
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Configuration

### Contract Address

Update the contract address in `src/constants/contract.js`:

```javascript
export const CONTRACT_CONFIG = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Your contract address
  networks: {
    localhost: {
      chainId: 31337,
      name: "Localhost",
      rpcUrl: "http://127.0.0.1:8545"
    },
    sepolia: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY" // Add your Infura key
    }
  }
};
```

### Network Setup

The app supports two networks by default:

1. **Hardhat Localhost** (Chain ID: 31337)
2. **Sepolia Testnet** (Chain ID: 11155111)

To add more networks, update the `networks` object in the contract configuration.

## Usage

### 1. Connect Wallet
- Click "Connect MetaMask" to connect your wallet
- Ensure you're on a supported network (Localhost or Sepolia)
- Your address, balance, and network will be displayed

### 2. Create a Project
- Enter a project name and funding goal in ETH
- Click "Create Project" and confirm the transaction
- Your project will appear in the project list

### 3. Invest in Projects
- Browse available projects in the project list
- Click "Invest" on any active project
- Enter your investment amount and confirm
- Your investment will be tracked and displayed

### 4. Withdraw Funds (Project Owners)
- If you own a project with raised funds, you'll see a "Withdraw Funds" button
- Click to withdraw all raised funds to your wallet
- The project will be marked as completed after withdrawal

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── CreateProject.jsx      # Project creation form
│   │   ├── Footer.jsx             # App footer
│   │   ├── Header.jsx             # App header
│   │   ├── InvestModal.jsx        # Investment modal
│   │   ├── ProjectCard.jsx        # Individual project display
│   │   ├── ProjectList.jsx        # List of all projects
│   │   └── WalletConnection.jsx   # Wallet connection UI
│   ├── constants/
│   │   └── contract.js            # Contract ABI and configuration
│   ├── hooks/
│   │   ├── useQuickStarterContract.js  # Contract interaction hook
│   │   └── useWallet.js           # Wallet management hook
│   ├── App.jsx                    # Main app component
│   ├── index.css                  # Global styles
│   └── main.jsx                   # App entry point
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Key Components

### Custom Hooks

- **`useWallet`** - Manages MetaMask connection, account, balance, and network
- **`useQuickStarterContract`** - Handles all smart contract interactions

### Components

- **`WalletConnection`** - Wallet connection status and controls
- **`CreateProject`** - Form for creating new crowdfunding projects
- **`ProjectList`** - Displays all projects with filtering and refresh
- **`ProjectCard`** - Individual project display with investment/withdrawal actions
- **`InvestModal`** - Modal for making investments with amount validation

## Smart Contract Integration

The frontend integrates with the QuickStarter smart contract through these main functions:

- `createProject(name, goalAmount)` - Create new projects
- `invest(projectId)` - Invest ETH in projects
- `withdraw(projectId)` - Withdraw funds (owner only)
- `getProject(projectId)` - Fetch project details
- `projects(projectId)` - Access project mapping
- `investments(projectId, address)` - Check user investments

## Error Handling

The app includes comprehensive error handling for:

- MetaMask not installed
- Wallet connection failures
- Unsupported networks
- Transaction rejections
- Insufficient funds
- Contract interaction errors

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Contract Functions**: Add to `useQuickStarterContract` hook
2. **UI Components**: Create in `src/components/`
3. **Styling**: Use Tailwind CSS classes or extend in `tailwind.config.js`
4. **State Management**: Use React hooks (useState, useEffect)

## Troubleshooting

### Common Issues

1. **"Contract not deployed"**
   - Ensure the contract address in `contract.js` is correct
   - Verify you're on the right network

2. **"MetaMask not detected"**
   - Install MetaMask browser extension
   - Refresh the page after installation

3. **"Unsupported network"**
   - Switch to Localhost (31337) or Sepolia (11155111)
   - Update network configuration if using different networks

4. **Transaction failures**
   - Check you have enough ETH for gas fees
   - Ensure the project is still active
   - Verify you're the project owner for withdrawals

### Getting Test ETH

- **Localhost**: Use Hardhat's default accounts with pre-funded ETH
- **Sepolia**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details