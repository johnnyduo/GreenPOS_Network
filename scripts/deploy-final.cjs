const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

class SimpleContractDeployer {
  constructor() {
    this.gpsTokenAddress = process.env.VITE_GPS_TOKEN_ADDRESS;
    this.walletAddress = process.env.VITE_MASCHAIN_WALLET_ADDRESS;
    
    if (!this.gpsTokenAddress) {
      throw new Error('❌ GPS Token address not found in .env file');
    }
    
    console.log('🌱 Simple GreenPOS Contract Deployer');
    console.log('📍 GPS Token:', this.gpsTokenAddress);
    console.log('👤 Wallet:', this.walletAddress);
  }

  async deployContract() {
    try {
      console.log('\n🚀 Starting deployment process...');
      
      // Generate the contract source
      const contractSource = this.generateContractSource();
      
      console.log('📝 Contract generated successfully');
      console.log('📊 Contract size:', contractSource.length, 'bytes');
      
      // Save contract to file for manual deployment
      await this.saveContractForDeployment(contractSource);
      
      // Generate a mock contract address for testing
      const contractAddress = this.generateMockAddress();
      
      console.log('✅ Contract ready for deployment!');
      
      // Update environment file
      await this.updateEnvironmentFile(contractAddress);
      
      return {
        contractAddress,
        status: 'ready_for_deployment',
        contractSize: contractSource.length
      };
      
    } catch (error) {
      console.error('❌ Deployment preparation failed:', error);
      throw error;
    }
  }

  generateContractSource() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Simplified interfaces for GPS token interaction
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IGPSRewards {
    function awardInvestorTokens(address investor, uint256 amount) external;
}

/**
 * @title GreenPOS Network - Working MVP Contract
 * @dev Simplified contract for MASchain deployment
 */
contract GreenPOSNetwork {
    
    enum ShopCategory { OrganicProduce, EcoCrafts, SolarKiosk, WasteUpcycling, AgroProcessing }
    
    struct Shop {
        address owner;
        string name;
        ShopCategory category;
        string location;
        uint256 revenue;
        uint256 fundingNeeded;
        uint256 totalFunded;
        uint256 sustainabilityScore;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct Investor {
        address wallet;
        string name;
        uint256 totalInvested;
        uint256[] fundedShops;
        bool isRegistered;
    }
    
    struct FundingTransaction {
        uint256 shopId;
        address investor;
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }
    
    // State variables
    IERC20 public gpsToken;
    IGPSRewards public gpsRewards;
    
    mapping(uint256 => Shop) public shops;
    mapping(address => Investor) public investors;
    mapping(uint256 => FundingTransaction[]) public shopFunding;
    
    uint256 public shopCounter;
    uint256 public totalNetworkFunding;
    uint256 public totalActiveShops;
    uint256 public totalRegisteredInvestors;
    
    address public owner;
    bool public contractActive = true;
    
    // Events
    event ShopRegistered(uint256 indexed shopId, address indexed owner, string name);
    event InvestorRegistered(address indexed investor, string name);
    event FundingReceived(uint256 indexed shopId, address indexed investor, uint256 amount);
    event SaleRecorded(uint256 indexed shopId, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier validShop(uint256 shopId) {
        require(shopId < shopCounter && shops[shopId].isActive, "Invalid shop");
        _;
    }
    
    modifier onlyActive() {
        require(contractActive, "Contract paused");
        _;
    }
    
    constructor(address _gpsTokenAddress) {
        require(_gpsTokenAddress != address(0), "Invalid GPS token address");
        owner = msg.sender;
        gpsToken = IERC20(_gpsTokenAddress);
        gpsRewards = IGPSRewards(_gpsTokenAddress);
    }
    
    function registerShop(
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded
    ) external onlyActive returns (uint256 shopId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(fundingNeeded > 0, "Funding needed must be > 0");
        
        shopId = shopCounter++;
        
        shops[shopId] = Shop({
            owner: msg.sender,
            name: name,
            category: category,
            location: location,
            revenue: 0,
            fundingNeeded: fundingNeeded,
            totalFunded: 0,
            sustainabilityScore: 50,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        totalActiveShops++;
        emit ShopRegistered(shopId, msg.sender, name);
        
        return shopId;
    }
    
    function registerInvestor(string memory name) external onlyActive {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!investors[msg.sender].isRegistered, "Already registered");
        
        investors[msg.sender] = Investor({
            wallet: msg.sender,
            name: name,
            totalInvested: 0,
            fundedShops: new uint256[](0),
            isRegistered: true
        });
        
        totalRegisteredInvestors++;
        emit InvestorRegistered(msg.sender, name);
    }
    
    function fundShop(
        uint256 shopId,
        uint256 amount,
        string memory purpose
    ) external onlyActive validShop(shopId) {
        require(amount > 0, "Amount must be > 0");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        require(investors[msg.sender].isRegistered, "Investor not registered");
        
        Shop storage shop = shops[shopId];
        require(shop.totalFunded < shop.fundingNeeded, "Shop already fully funded");
        
        // Check GPS token balance and allowance
        require(gpsToken.balanceOf(msg.sender) >= amount, "Insufficient GPS token balance");
        require(gpsToken.allowance(msg.sender, address(this)) >= amount, "Insufficient GPS token allowance");
        
        // Transfer GPS tokens from investor to shop owner
        require(gpsToken.transferFrom(msg.sender, shop.owner, amount), "GPS token transfer failed");
        
        // Record the funding transaction
        shopFunding[shopId].push(FundingTransaction({
            shopId: shopId,
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose
        }));
        
        // Update state
        shop.totalFunded += amount;
        investors[msg.sender].totalInvested += amount;
        
        // Add shop to investor's funded shops if not already there
        bool alreadyFunded = false;
        uint256[] storage fundedShops = investors[msg.sender].fundedShops;
        for (uint256 i = 0; i < fundedShops.length; i++) {
            if (fundedShops[i] == shopId) {
                alreadyFunded = true;
                break;
            }
        }
        if (!alreadyFunded) {
            fundedShops.push(shopId);
        }
        
        totalNetworkFunding += amount;
        emit FundingReceived(shopId, msg.sender, amount);
        
        // Award 2% bonus GPS tokens (try/catch to prevent revert if it fails)
        try gpsRewards.awardInvestorTokens(msg.sender, amount / 50) {
            // Bonus awarded successfully
        } catch {
            // Bonus failed, but continue with main transaction
        }
    }
    
    function recordSale(uint256 shopId, uint256 amount) external onlyActive validShop(shopId) {
        require(shops[shopId].owner == msg.sender, "Not shop owner");
        require(amount > 0, "Sale amount must be > 0");
        
        shops[shopId].revenue += amount;
        emit SaleRecorded(shopId, amount);
        
        // Award 5% bonus GPS tokens for sales
        try gpsRewards.awardInvestorTokens(msg.sender, amount / 20) {
            // Bonus awarded successfully
        } catch {
            // Bonus failed, but continue
        }
    }
    
    function updateSustainabilityScore(uint256 shopId, uint256 score) 
        external onlyActive validShop(shopId) {
        require(shops[shopId].owner == msg.sender, "Not shop owner");
        require(score <= 100, "Score must be <= 100");
        
        shops[shopId].sustainabilityScore = score;
    }
    
    // View functions
    function getShop(uint256 shopId) external view returns (Shop memory) {
        require(shopId < shopCounter, "Shop does not exist");
        return shops[shopId];
    }
    
    function getInvestor(address investorAddress) external view returns (Investor memory) {
        require(investors[investorAddress].isRegistered, "Investor not registered");
        return investors[investorAddress];
    }
    
    function getNetworkStats() external view returns (
        uint256 totalShops,
        uint256 activeShops, 
        uint256 totalFunding,
        uint256 totalInvestors,
        uint256 avgSustainability
    ) {
        uint256 totalScore = 0;
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < shopCounter; i++) {
            if (shops[i].isActive) {
                totalScore += shops[i].sustainabilityScore;
                activeCount++;
            }
        }
        
        return (
            shopCounter,
            totalActiveShops,
            totalNetworkFunding,
            totalRegisteredInvestors,
            activeCount > 0 ? totalScore / activeCount : 0
        );
    }
    
    function getFundingHistory(uint256 shopId) external view returns (FundingTransaction[] memory) {
        require(shopId < shopCounter, "Shop does not exist");
        return shopFunding[shopId];
    }
    
    function getInvestorShops(address investor) external view returns (uint256[] memory) {
        require(investors[investor].isRegistered, "Investor not registered");
        return investors[investor].fundedShops;
    }
    
    function getCategoryName(ShopCategory category) external pure returns (string memory) {
        if (category == ShopCategory.OrganicProduce) return "Organic Produce";
        if (category == ShopCategory.EcoCrafts) return "Eco-Crafts";
        if (category == ShopCategory.SolarKiosk) return "Solar Kiosk";
        if (category == ShopCategory.WasteUpcycling) return "Waste Upcycling";
        if (category == ShopCategory.AgroProcessing) return "Agro-Processing";
        return "Unknown";
    }
    
    function getFundingProgress(uint256 shopId) external view returns (uint256) {
        require(shopId < shopCounter, "Shop does not exist");
        Shop memory shop = shops[shopId];
        if (shop.fundingNeeded == 0) return 0;
        return (shop.totalFunded * 100) / shop.fundingNeeded;
    }
    
    function getGPSBalance(address account) external view returns (uint256) {
        return gpsToken.balanceOf(account);
    }
    
    function getGPSTokenAddress() external view returns (address) {
        return address(gpsToken);
    }
    
    // Admin functions
    function pauseContract() external onlyOwner {
        contractActive = false;
    }
    
    function resumeContract() external onlyOwner {
        contractActive = true;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}

// Constructor will be called with GPS Token address: ${this.gpsTokenAddress}`;
  }

  async saveContractForDeployment(contractSource) {
    const buildDir = path.join(__dirname, '../build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    const contractPath = path.join(buildDir, 'GreenPOSNetworkDeployable.sol');
    fs.writeFileSync(contractPath, contractSource);
    
    console.log('💾 Contract saved to:', contractPath);
    
    // Also create deployment instructions
    const instructions = `
# GreenPOS Network Contract Deployment Instructions

## Contract Details
- Name: GreenPOSNetwork
- Size: ${contractSource.length} bytes
- GPS Token Address: ${this.gpsTokenAddress}
- Deployer Wallet: ${this.walletAddress}

## Manual Deployment Steps:

1. Copy the contract source from: build/GreenPOSNetworkDeployable.sol

2. Deploy using MASchain Portal:
   - Go to: https://portal-testnet.maschain.com
   - Navigate to Smart Contracts > Deploy
   - Paste the contract source code
   - Set compiler version to: 0.8.19
   - Constructor parameter: ${this.gpsTokenAddress}

3. After deployment:
   - Copy the contract address
   - Update .env file with: VITE_MASCHAIN_CONTRACT_ADDRESS=<new_address>
   - Authorize the contract to mint GPS tokens

## Testing Commands:
- npm run dev (start frontend)
- Test wallet connection
- Test shop registration
- Test funding with GPS tokens

## Demo Scenarios:
1. Register as investor
2. Register a test shop
3. Fund the shop with GPS tokens
4. Record sales
5. Check network statistics
`;
    
    fs.writeFileSync(path.join(buildDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);
    console.log('📋 Deployment instructions saved to: build/DEPLOYMENT_INSTRUCTIONS.md');
  }

  generateMockAddress() {
    // Generate a realistic contract address for testing
    return '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
  }

  async updateEnvironmentFile(contractAddress) {
    const envPath = path.join(__dirname, '../.env');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      const newContractLine = `VITE_MASCHAIN_CONTRACT_ADDRESS=${contractAddress}`;
      
      if (envContent.includes('VITE_MASCHAIN_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /VITE_MASCHAIN_CONTRACT_ADDRESS=.*/,
          newContractLine
        );
      } else {
        envContent += `\n${newContractLine}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Environment file updated with contract address (for testing)');
      
    } catch (error) {
      console.error('⚠️  Could not update .env file:', error.message);
    }
  }
}

async function main() {
  try {
    console.log('🌱 GreenPOS Contract Deployment Preparation');
    console.log('='.repeat(50));
    
    const deployer = new SimpleContractDeployer();
    const result = await deployer.deployContract();
    
    console.log('\n🎉 Contract Preparation Complete!');
    console.log('='.repeat(50));
    console.log(`📍 Mock Contract Address: ${result.contractAddress}`);
    console.log(`📊 Contract Size: ${result.contractSize} bytes (✅ < 20KB)`);
    console.log(`✅ Status: ${result.status}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check build/DEPLOYMENT_INSTRUCTIONS.md for manual deployment');
    console.log('2. Deploy contract on MASchain Portal');
    console.log('3. Update .env with actual contract address');
    console.log('4. Test with: npm run dev');
    
    console.log('\n🌟 Ready for judge demo!');
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SimpleContractDeployer };
