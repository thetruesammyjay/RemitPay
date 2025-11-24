#!/bin/bash

# RemitEasy Complete Deployment Script
# Deploys backend, frontend, and smart contract

set -e

echo "================================"
echo "RemitEasy Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing=0
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        missing=1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        missing=1
    fi
    
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI not found"
        missing=1
    fi
    
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI not found"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        print_error "Missing required tools. Please install them first."
        exit 1
    fi
    
    print_success "All prerequisites installed"
}

# Deploy smart contract
deploy_program() {
    print_info "Deploying smart contract..."
    
    cd program
    
    # Build program
    print_info "Building program..."
    anchor build
    
    # Get program ID
    PROGRAM_ID=$(solana address -k target/deploy/remiteasy-keypair.json)
    print_success "Program ID: $PROGRAM_ID"
    
    # Ask for network
    echo ""
    echo "Select deployment network:"
    echo "1) Localnet"
    echo "2) Devnet"
    echo "3) Mainnet"
    read -p "Enter choice (1-3): " network_choice
    
    case $network_choice in
        1)
            NETWORK="localnet"
            solana config set --url localhost
            ;;
        2)
            NETWORK="devnet"
            solana config set --url devnet
            ;;
        3)
            NETWORK="mainnet-beta"
            solana config set --url mainnet-beta
            print_info "⚠️  WARNING: Deploying to MAINNET"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" != "yes" ]; then
                print_error "Deployment cancelled"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Check balance
    BALANCE=$(solana balance | awk '{print $1}')
    print_info "Current balance: $BALANCE SOL"
    
    if (( $(echo "$BALANCE < 2" | bc -l) )); then
        print_error "Insufficient SOL balance (need at least 2 SOL)"
        
        if [ "$NETWORK" = "devnet" ]; then
            print_info "Requesting airdrop..."
            solana airdrop 2
        else
            exit 1
        fi
    fi
    
    # Deploy
    print_info "Deploying to $NETWORK..."
    anchor deploy
    
    print_success "Program deployed successfully!"
    
    cd ..
    
    # Save program ID for other deployments
    echo "$PROGRAM_ID" > .program_id
}

# Deploy backend
deploy_backend() {
    print_info "Deploying backend..."
    
    cd backend
    
    # Check if railway is installed
    if ! command -v railway &> /dev/null; then
        print_info "Railway CLI not found. Installing..."
        npm install -g railway
    fi
    
    # Login to railway
    print_info "Please log in to Railway..."
    railway login
    
    # Initialize if needed
    if [ ! -f "railway.json" ]; then
        print_info "Initializing Railway project..."
        railway init
    fi
    
    # Read program ID
    if [ -f "../.program_id" ]; then
        PROGRAM_ID=$(cat ../.program_id)
    else
        read -p "Enter Program ID: " PROGRAM_ID
    fi
    
    # Set environment variables
    print_info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set PROGRAM_ID=$PROGRAM_ID
    
    # Deploy
    print_info "Deploying to Railway..."
    railway up
    
    # Get domain
    BACKEND_URL=$(railway domain)
    print_success "Backend deployed to: $BACKEND_URL"
    
    # Save backend URL
    echo "$BACKEND_URL" > ../.backend_url
    
    cd ..
}

# Deploy frontend
deploy_frontend() {
    print_info "Deploying frontend..."
    
    cd frontend
    
    # Check if vercel is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Read program ID
    if [ -f "../.program_id" ]; then
        PROGRAM_ID=$(cat ../.program_id)
    else
        read -p "Enter Program ID: " PROGRAM_ID
    fi
    
    # Read backend URL
    if [ -f "../.backend_url" ]; then
        BACKEND_URL=$(cat ../.backend_url)
    else
        read -p "Enter Backend URL: " BACKEND_URL
    fi
    
    # Create production env file
    cat > .env.production << EOL
REACT_APP_SOLANA_NETWORK=mainnet-beta
REACT_APP_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
REACT_APP_PROGRAM_ID=$PROGRAM_ID
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
EOL
    
    # Deploy
    print_info "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed!"
    
    cd ..
}

# Main deployment flow
main() {
    echo "What would you like to deploy?"
    echo "1) Smart Contract only"
    echo "2) Backend only"
    echo "3) Frontend only"
    echo "4) Full stack (all three)"
    echo "5) Exit"
    
    read -p "Enter choice (1-5): " deploy_choice
    
    check_prerequisites
    
    case $deploy_choice in
        1)
            deploy_program
            ;;
        2)
            deploy_backend
            ;;
        3)
            deploy_frontend
            ;;
        4)
            deploy_program
            deploy_backend
            deploy_frontend
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    echo "================================"
    echo "Deployment Complete!"
    echo "================================"
    
    if [ -f ".program_id" ]; then
        echo "Program ID: $(cat .program_id)"
    fi
    
    if [ -f ".backend_url" ]; then
        echo "Backend URL: $(cat .backend_url)"
    fi
    
    print_success "All deployments successful! 🎉"
}

# Run main function
main
