// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title GreenPOS Token Interface
 * @dev Interface for interacting with GPS tokens
 */
interface IGreenPOSToken {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function awardInvestorTokens(address investor, uint256 amount) external;
    function awardShopTokens(address shop, uint256 amount) external;
}

/**
 * @title GreenPOS Network Lite - Optimized MVP Contract
 * @dev Lightweight contract for connecting rural shops with impact investors using GPS tokens
 * @author GreenPOS Team
 */
contract GreenPOSNetworkLite {
    
    // =============================================================================
    // CORE STRUCTS & ENUMS
    // =============================================================================
    
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
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    IGreenPOSToken public immutable gpsToken;
    
    mapping(uint256 => Shop) public shops;
    mapping(address => Investor) public investors;
    mapping(uint256 => FundingTransaction[]) public shopFunding;
    
    uint256 public shopCounter;
    uint256 public totalNetworkFunding;
    uint256 public totalActiveShops;
    uint256 public totalRegisteredInvestors;
    
    address public owner;
    bool public contractActive = true;
    
    // Reentrancy protection
    bool private _locked;
    
    // Constants
    uint256 public constant MIN_FUNDING = 100 * 10**18; // 100 GPS
    uint256 public constant MAX_FUNDING = 1_000_000 * 10**18; // 1M GPS
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event ShopRegistered(uint256 indexed shopId, address indexed owner, string name);
    event InvestorRegistered(address indexed investor, string name);
    event FundingReceived(uint256 indexed shopId, address indexed investor, uint256 amount);
    event SaleRecorded(uint256 indexed shopId, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyShopOwner(uint256 shopId) {
        require(shops[shopId].owner == msg.sender, "Not shop owner");
        _;
    }
    
    modifier validShop(uint256 shopId) {
        require(shopId < shopCounter && shops[shopId].isActive, "Invalid shop");
        _;
    }
    
    modifier contractIsActive() {
        require(contractActive, "Contract paused");
        _;
    }
    
    /**
     * @dev Prevents reentrancy attacks
     */
    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(address _gpsTokenAddress) {
        require(_gpsTokenAddress != address(0), "Invalid GPS token");
        owner = msg.sender;
        gpsToken = IGreenPOSToken(_gpsTokenAddress);
        _locked = false;
    }
    
    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Register a new shop
     */
    function registerShop(
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded
    ) external contractIsActive returns (uint256 shopId) {
        require(bytes(name).length > 0, "Empty name");
        require(bytes(location).length > 0, "Empty location");
        require(fundingNeeded >= MIN_FUNDING && fundingNeeded <= MAX_FUNDING, "Invalid funding amount");
        
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
    }
    
    /**
     * @dev Register as investor
     */
    function registerInvestor(string memory name) external contractIsActive {
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
    
    /**
     * @dev Fund a shop with GPS tokens
     */
    function fundShop(
        uint256 shopId,
        uint256 amount,
        string memory purpose
    ) external contractIsActive validShop(shopId) nonReentrant {
        require(amount > 0, "Zero amount");
        require(bytes(purpose).length > 0, "Empty purpose");
        require(investors[msg.sender].isRegistered, "Not registered investor");
        
        Shop storage shop = shops[shopId];
        require(shop.totalFunded < shop.fundingNeeded, "Fully funded");
        
        // Check GPS token balance and allowance
        require(gpsToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(gpsToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer GPS tokens from investor to shop owner
        require(gpsToken.transferFrom(msg.sender, shop.owner, amount), "Transfer failed");
        
        // Record funding
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
        
        // Add to investor's funded shops if new
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
        
        // Award 2% bonus GPS tokens
        _awardBonus(msg.sender, (amount * 2) / 100);
    }
    
    /**
     * @dev Record a sale
     */
    function recordSale(uint256 shopId, uint256 amount) 
        external contractIsActive onlyShopOwner(shopId) {
        require(amount > 0, "Zero amount");
        
        shops[shopId].revenue += amount;
        emit SaleRecorded(shopId, amount);
        
        // Award 5% bonus GPS tokens
        _awardBonus(msg.sender, (amount * 5) / 100);
    }
    
    /**
     * @dev Update sustainability score
     */
    function updateSustainabilityScore(uint256 shopId, uint256 score) 
        external contractIsActive onlyShopOwner(shopId) {
        require(score <= 100, "Score > 100");
        shops[shopId].sustainabilityScore = score;
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    function getShop(uint256 shopId) external view returns (Shop memory) {
        require(shopId < shopCounter, "Shop not found");
        return shops[shopId];
    }
    
    function getInvestor(address addr) external view returns (Investor memory) {
        require(investors[addr].isRegistered, "Not registered");
        return investors[addr];
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
        require(shopId < shopCounter, "Shop not found");
        return shopFunding[shopId];
    }
    
    function getInvestorShops(address investor) external view returns (uint256[] memory) {
        require(investors[investor].isRegistered, "Not registered");
        return investors[investor].fundedShops;
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    function getCategoryName(ShopCategory category) external pure returns (string memory) {
        if (category == ShopCategory.OrganicProduce) return "Organic Produce";
        if (category == ShopCategory.EcoCrafts) return "Eco-Crafts";
        if (category == ShopCategory.SolarKiosk) return "Solar Kiosk";
        if (category == ShopCategory.WasteUpcycling) return "Waste Upcycling";
        if (category == ShopCategory.AgroProcessing) return "Agro-Processing";
        return "Unknown";
    }
    
    function getFundingProgress(uint256 shopId) external view returns (uint256) {
        require(shopId < shopCounter, "Shop not found");
        Shop memory shop = shops[shopId];
        if (shop.fundingNeeded < MIN_FUNDING) return 0; // Use safe comparison
        return (shop.totalFunded * 100) / shop.fundingNeeded;
    }
    
    function getGPSBalance(address account) external view returns (uint256) {
        return gpsToken.balanceOf(account);
    }
    
    function getGPSTokenAddress() external view returns (address) {
        return address(gpsToken);
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    function pauseContract() external onlyOwner {
        contractActive = false;
    }
    
    function resumeContract() external onlyOwner {
        contractActive = true;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    // =============================================================================
    // INTERNAL FUNCTIONS
    // =============================================================================
    
    function _awardBonus(address recipient, uint256 amount) internal {
        try gpsToken.awardInvestorTokens(recipient, amount) {
            // Bonus awarded
        } catch {
            // Bonus failed, continue
        }
    }
}
