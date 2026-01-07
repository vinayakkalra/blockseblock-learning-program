import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © 2024 QuickStarter. Built with React, ethers.js, and Tailwind CSS.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Decentralized crowdfunding on Ethereum
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
            >
              <span className="text-sm">Ethereum</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>
              <strong>Supported Networks:</strong> Localhost (Hardhat), Sepolia Testnet
            </p>
            <p>
              <strong>Requirements:</strong> MetaMask wallet extension
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;