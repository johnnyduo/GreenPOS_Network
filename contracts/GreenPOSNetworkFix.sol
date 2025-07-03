// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GreenPOS Token Interface
 * @dev Interface for interacting with GPS tokens on MASchain
 */
interface IGreenPOSToken {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title GreenPOS Network - MASchain Optimized
 * @dev Simplified contract for MASchain deployment
 * @author GreenPOS Team
 */
contract GreenPOSNetwork {
    
    enum ShopCategory { OrganicProduce, EcoCrafts, SolarKiosk, WasteUpcycling, AgroProcessing }
    
    struct Shop {
        address owner;
        string name;
        ShopCategory category;
        string location;
        uint256 fundingNeeded;
        uint256 totalFunded;
        uint256 availableBalance;
        uint256 sustainabilityScore;
        bool isActive;
        uint256 totalWithdrawn;
    }
    
    struct Investor {
        address wallet;
        string name;
        uint256 totalInvested;
        uint256[] fundedShops;
        bool isRegistered;
    }
    
    struct FundingRecord {
        address investor;
        uint256 amount;
        uint256 timestamp;
    }
    
    IGreenPOSToken public gpsToken;
    
    mapping(uint256 => Shop) public shops;
    mapping(address => Investor) public investors;
    mapping(uint256 => FundingRecord[]) public shopFundings;
    
    uint256 public shopCounter;
    uint256 public totalNetworkFunding;
    uint256 public totalActiveShops;
    uint256 public totalRegisteredInvestors;
    
    address public owner;
    bool private _locked;
    
    uint256 public constant MIN_FUNDING = 100 * 10**18;
    uint256 public constant MAX_FUNDING = 1000000 * 10**18;
    uint256 public constant MIN_WITHDRAWAL = 10 * 10**18;
    
    event ShopRegistered(uint256 indexed shopId, address indexed owner, string name);
    event InvestorRegistered(address indexed investor, string name);
    event ShopFunded(uint256 indexed shopId, address indexed investor, uint256 amount);
    event FundsWithdrawn(uint256 indexed shopId, uint256 amount);
    event SaleRecorded(uint256 indexed shopId, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyShopOwner(uint256 shopId) {
        require(shops[shopId].owner == msg.sender, "Not shop owner");
        _;
    }
    
    modifier validShop(uint256 shopId) {
        require(shopId < shopCounter, "Invalid shop");
        require(shops[shopId].isActive, "Shop not active");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "No reentry");
        _locked = true;
        _;
        _locked = false;
    }
    
    constructor(address _gpsTokenAddress) {
        require(_gpsTokenAddress != address(0), "Invalid token");
        owner = msg.sender;
        gpsToken = IGreenPOSToken(_gpsTokenAddress);
    }
    
    function registerShop(
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Empty name");
        require(bytes(location).length > 0, "Empty location");
        require(fundingNeeded >= MIN_FUNDING, "Below min funding");
        require(fundingNeeded <= MAX_FUNDING, "Above max funding");
        
        uint256 shopId = shopCounter++;
        
        shops[shopId] = Shop({
            owner: msg.sender,
            name: name,
            category: category,
            location: location,
            fundingNeeded: fundingNeeded,
            totalFunded: 0,
            availableBalance: 0,
            sustainabilityScore: 50,
            isActive: true,
            totalWithdrawn: 0
        });
        
        totalActiveShops++;
        emit ShopRegistered(shopId, msg.sender, name);
        
        return shopId;
    }
    
    function registerInvestor(string memory name) external {
        require(bytes(name).length > 0, "Empty name");
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
    
    function fundShop(uint256 shopId, uint256 amount) 
        external validShop(shopId) nonReentrant {
        require(amount > 0, "Zero amount");
        require(investors[msg.sender].isRegistered, "Not registered investor");
        
        Shop storage shop = shops[shopId];
        require(shop.totalFunded < shop.fundingNeeded, "Shop fully funded");
        
        uint256 remainingNeeded = shop.fundingNeeded - shop.totalFunded;
        require(amount <= remainingNeeded, "Amount exceeds need");
        
        // Check token balance and allowance
        require(gpsToken.balanceOf(msg.sender) >= amount, "Insufficient GPS");
        require(gpsToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer tokens to contract
        require(gpsToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update state
        shop.totalFunded += amount;
        shop.availableBalance += amount;
        investors[msg.sender].totalInvested += amount;
        totalNetworkFunding += amount;
        
        // Record funding
        shopFundings[shopId].push(FundingRecord({
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp
        }));
        
        // Add to investor's funded shops
        _addToFundedShops(msg.sender, shopId);
        
        emit ShopFunded(shopId, msg.sender, amount);
    }
    
    function withdrawFunds(uint256 shopId, uint256 amount) 
        external onlyShopOwner(shopId) nonReentrant {
        require(amount >= MIN_WITHDRAWAL, "Below min withdrawal");
        
        Shop storage shop = shops[shopId];
        require(shop.availableBalance >= amount, "Insufficient balance");
        
        shop.availableBalance -= amount;
        shop.totalWithdrawn += amount;
        
        require(gpsToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit FundsWithdrawn(shopId, amount);
    }
    
    function recordSale(uint256 shopId, uint256 amount) 
        external onlyShopOwner(shopId) {
        require(amount > 0, "Zero amount");
        emit SaleRecorded(shopId, amount);
    }
    
    function updateSustainabilityScore(uint256 shopId, uint256 score) 
        external onlyShopOwner(shopId) {
        require(score <= 100, "Invalid score");
        shops[shopId].sustainabilityScore = score;
    }
    
    function _addToFundedShops(address investor, uint256 shopId) private {
        uint256[] storage funded = investors[investor].fundedShops;
        for (uint256 i = 0; i < funded.length; i++) {
            if (funded[i] == shopId) return;
        }
        funded.push(shopId);
    }
    
    // View functions
    function getShop(uint256 shopId) external view returns (
        address shopOwner,
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded,
        uint256 totalFunded,
        uint256 availableBalance,
        uint256 sustainabilityScore,
        bool isActive
    ) {
        Shop memory shop = shops[shopId];
        return (
            shop.owner,
            shop.name,
            shop.category,
            shop.location,
            shop.fundingNeeded,
            shop.totalFunded,
            shop.availableBalance,
            shop.sustainabilityScore,
            shop.isActive
        );
    }
    
    function getInvestor(address addr) external view returns (
        address wallet,
        string memory name,
        uint256 totalInvested,
        uint256[] memory fundedShops,
        bool isRegistered
    ) {
        Investor memory investor = investors[addr];
        return (
            investor.wallet,
            investor.name,
            investor.totalInvested,
            investor.fundedShops,
            investor.isRegistered
        );
    }
    
    function getShopBalance(uint256 shopId) external view returns (uint256) {
        return shops[shopId].availableBalance;
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
    
    function getFundingHistory(uint256 shopId) external view returns (FundingRecord[] memory) {
        return shopFundings[shopId];
    }
    
    function getContractBalance() external view returns (uint256) {
        return gpsToken.balanceOf(address(this));
    }
}