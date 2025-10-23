#!/bin/bash

# Proof of Dev Wave 3 - Deployment Script
# This script deploys the contract and updates environment variables

set -e  # Exit on any error

echo "🚀 Proof of Dev Wave 3 - Contract Deployment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the proof-of-dev directory"
    exit 1
fi

# Check if Hardhat is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Compiling contracts..."
npm run hh:compile

if [ $? -ne 0 ]; then
    echo "❌ Error: Contract compilation failed"
    exit 1
fi

echo "🌐 Deploying to Moca Testnet..."
echo "This may take a few minutes..."

# Deploy the contract
DEPLOY_OUTPUT=$(npm run hh:deploy:moca 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "❌ Error: Contract deployment failed"
    echo "Deploy output:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o '0x[a-fA-F0-9]\{40\}' | tail -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: Could not extract contract address from deployment output"
    echo "Deploy output:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📍 Contract Address: $CONTRACT_ADDRESS"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Update .env.local with contract address
if [ -f ".env.local" ]; then
    echo "🔧 Updating .env.local with contract address..."
    
    # Check if PROOF_OF_DEV_CONTRACT_ADDRESS already exists
    if grep -q "PROOF_OF_DEV_CONTRACT_ADDRESS" .env.local; then
        # Update existing line
        sed -i.bak "s/PROOF_OF_DEV_CONTRACT_ADDRESS=.*/PROOF_OF_DEV_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env.local
        rm .env.local.bak 2>/dev/null || true
    else
        # Add new line
        echo "PROOF_OF_DEV_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
    fi
    
    echo "✅ Updated .env.local with contract address"
else
    echo "⚠️  .env.local not found. Please create it manually with:"
    echo "PROOF_OF_DEV_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Network: Moca Testnet"
echo "Explorer: https://testnet-explorer.mocachain.org/address/$CONTRACT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Update other environment variables in .env.local"
echo "2. Restart your development server: npm run dev"
echo "3. Test minting credentials in the app"
echo ""
echo "To verify deployment:"
echo "curl http://localhost:3000/api/diagnostics"
