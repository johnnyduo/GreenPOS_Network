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
 * @title GreenPOS Network Smart Contract
 * @dev MVP contract for connecting rural shops with impact investors using GPS tokens
 * @author GreenPOS Team
 */
contract GreenPOSNetwork {
    
    // =============================================================================
    // STRUCTS & ENUMS
    // =============================================================================
    
    enum ShopCategory { OrganicProduce, EcoCrafts, SolarKiosk, WasteUpcycling, AgroProcessing }
    
    struct Shop {
        address owner;
        string name;
        ShopCategory category;
        string location; // Country/Region
        uint256 revenue; // Total revenue in wei
        uint256 fundingNeeded;
        uint256 totalFunded;
        uint256 sustainabilityScore; // 0-100
        bool isActive;
        uint256 registeredAt;
        uint256 lastSaleAt;
    }
    
    struct Investor {
        address wallet;
        string name;
        uint256 totalInvested;
        uint256 activeInvestments;
        uint256[] fundedShops;
        bool isRegistered;
    }
    
    struct FundingTransaction {
        uint256 shopId;
        address investor;
        uint256 amount;
        uint256 timestamp;
        string purpose; // "Stock", "Equipment", "Expansion"
        bool isActive;
    }
    
    struct NetworkStats {
        uint256 totalShops;
        uint256 totalActiveShops;
        uint256 totalFunding;
        uint256 totalInvestors;
        uint256 averageSustainabilityScore;
        uint256 totalTransactions;
    }
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    // Constants for validation
    uint256 public constant MIN_FUNDING_AMOUNT = 100 * 10**18; // Minimum 100 GPS tokens
    uint256 public constant MAX_FUNDING_AMOUNT = 1_000_000 * 10**18; // Maximum 1M GPS tokens
    uint256 public constant MAX_SUSTAINABILITY_SCORE = 100;
    
    // GPS Token contract interface
    IGreenPOSToken public immutable gpsToken;
    
    mapping(uint256 => Shop) public shops;
    mapping(address => Investor) public investors;
    mapping(uint256 => FundingTransaction[]) public shopFunding;
    mapping(uint256 => uint256[]) public shopSales; // shopId => sale amounts
    mapping(address => uint256[]) public investorShops; // investor => shop IDs
    
    uint256 public shopCounter;
    uint256 public totalNetworkFunding;
    uint256 public totalActiveShops;
    uint256 public totalRegisteredInvestors;
    uint256 public totalTransactions;
    
    address public owner;
    bool public contractActive;
    
    // Reentrancy protection
    bool private _locked;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event ShopRegistered(
        uint256 indexed shopId, 
        address indexed owner, 
        string name, 
        ShopCategory category,
        string location
    );
    
    event InvestorRegistered(
        address indexed investor, 
        string name
    );
    
    event FundingReceived(
        uint256 indexed shopId, 
        address indexed investor, 
        uint256 amount, 
        string purpose
    );
    
    event SaleRecorded(
        uint256 indexed shopId, 
        uint256 amount, 
        uint256 timestamp
    );
    
    event SustainabilityUpdated(
        uint256 indexed shopId, 
        uint256 oldScore, 
        uint256 newScore
    );
    
    event ShopStatusChanged(
        uint256 indexed shopId, 
        bool isActive
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }
    
    modifier onlyShopOwner(uint256 shopId) {
        require(shopId < shopCounter, "Shop does not exist");
        require(shops[shopId].owner == msg.sender, "Not shop owner");
        _;
    }
    
    modifier validShop(uint256 shopId) {
        require(shopId < shopCounter, "Shop does not exist");
        require(shops[shopId].isActive, "Shop is not active");
        _;
    }
    
    modifier contractIsActive() {
        require(contractActive, "Contract is not active");
        _;
    }
    
    modifier validSustainabilityScore(uint256 score) {
        require(score <= MAX_SUSTAINABILITY_SCORE, "Score must be 0-100");
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
        require(_gpsTokenAddress != address(0), "Invalid GPS token address");
        
        owner = msg.sender;
        contractActive = true;
        shopCounter = 0;
        totalNetworkFunding = 0;
        totalActiveShops = 0;
        _locked = false;
        
        gpsToken = IGreenPOSToken(_gpsTokenAddress);
    }
    
    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Register a new shop in the network
     * @param name Shop name
     * @param category Business category
     * @param location Geographic location
     * @param fundingNeeded Target funding amount
     * @return shopId The unique shop identifier
     */
    function registerShop(
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded
    ) external contractIsActive returns (uint256 shopId) {
        require(bytes(name).length > 0, "Shop name cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(fundingNeeded >= MIN_FUNDING_AMOUNT, "Funding needed too low");
        require(fundingNeeded <= MAX_FUNDING_AMOUNT, "Funding needed too high");
        
        shopId = shopCounter;
        
        shops[shopId] = Shop({
            owner: msg.sender,
            name: name,
            category: category,
            location: location,
            revenue: 0,
            fundingNeeded: fundingNeeded,
            totalFunded: 0,
            sustainabilityScore: 50, // Default score
            isActive: true,
            registeredAt: block.timestamp,
            lastSaleAt: 0
        });
        
        shopCounter++;
        totalActiveShops++;
        
        emit ShopRegistered(shopId, msg.sender, name, category, location);
        
        return shopId;
    }
    
    /**
     * @dev Register as an investor in the network
     * @param name Investor name/organization
     */
    function registerInvestor(string memory name) external contractIsActive {
        require(bytes(name).length > 0, "Investor name cannot be empty");
        require(!investors[msg.sender].isRegistered, "Investor already registered");
        
        investors[msg.sender] = Investor({
            wallet: msg.sender,
            name: name,
            totalInvested: 0,
            activeInvestments: 0,
            fundedShops: new uint256[](0),
            isRegistered: true
        });
        
        totalRegisteredInvestors++;
        
        emit InvestorRegistered(msg.sender, name);
    }
    
    /**
     * @dev Fund a shop with GPS tokens
     * @param shopId Target shop ID
     * @param amount GPS token amount to fund
     * @param purpose Funding purpose description
     */
    function fundShop(
        uint256 shopId,
        uint256 amount,
        string memory purpose
    ) external contractIsActive validShop(shopId) nonReentrant {
        require(amount > 0, "Funding amount must be greater than 0");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        require(investors[msg.sender].isRegistered, "Investor not registered");
        
        Shop storage shop = shops[shopId];
        require(shop.fundingNeeded > 0, "Shop has no funding goal set");
        require(shop.totalFunded < shop.fundingNeeded, "Shop funding goal already met");
        
        // Check if investor has enough GPS tokens
        require(gpsToken.balanceOf(msg.sender) >= amount, "Insufficient GPS token balance");
        require(gpsToken.allowance(msg.sender, address(this)) >= amount, "Insufficient GPS token allowance");
        
        // Additional safety check to prevent overflow
        require(shop.totalFunded + amount >= shop.totalFunded, "Funding amount overflow");
        
        // Transfer GPS tokens from investor to shop owner
        require(gpsToken.transferFrom(msg.sender, shop.owner, amount), "GPS token transfer failed");
        
        // Record the funding transaction
        FundingTransaction memory transaction = FundingTransaction({
            shopId: shopId,
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose,
            isActive: true
        });
        
        shopFunding[shopId].push(transaction);
        
        // Update shop funding
        shop.totalFunded += amount;
        
        // Update investor stats
        Investor storage investor = investors[msg.sender];
        investor.totalInvested += amount;
        
        // Add shop to investor's funded shops if not already there
        bool alreadyFunded = false;
        for (uint256 i = 0; i < investor.fundedShops.length; i++) {
            if (investor.fundedShops[i] == shopId) {
                alreadyFunded = true;
                break;
            }
        }
        
        if (!alreadyFunded) {
            investor.fundedShops.push(shopId);
            investor.activeInvestments++;
            investorShops[msg.sender].push(shopId);
        }
        
        // Update network stats
        totalNetworkFunding += amount;
        totalTransactions++;
        
        emit FundingReceived(shopId, msg.sender, amount, purpose);
        
        // Award bonus GPS tokens for successful funding (from ecosystem wallet)
        _awardFundingBonus(msg.sender, amount);
    }
    
    /**
     * @dev Record a sale for a shop and award GPS tokens
     * @param shopId Shop ID
     * @param amount Sale amount
     */
    function recordSale(
        uint256 shopId,
        uint256 amount
    ) external contractIsActive onlyShopOwner(shopId) {
        require(amount > 0, "Sale amount must be greater than 0");
        
        Shop storage shop = shops[shopId];
        shop.revenue += amount;
        shop.lastSaleAt = block.timestamp;
        
        shopSales[shopId].push(amount);
        totalTransactions++;
        
        emit SaleRecorded(shopId, amount, block.timestamp);
        
        // Award GPS tokens for sales milestone (5% of sale amount)
        uint256 rewardAmount = (amount * 5) / 100;
        _awardSalesBonus(shop.owner, rewardAmount);
    }
    
    /**
     * @dev Update shop's sustainability score
     * @param shopId Shop ID
     * @param score New sustainability score (0-100)
     */
    function updateSustainabilityScore(
        uint256 shopId,
        uint256 score
    ) external contractIsActive onlyShopOwner(shopId) validSustainabilityScore(score) {
        Shop storage shop = shops[shopId];
        uint256 oldScore = shop.sustainabilityScore;
        shop.sustainabilityScore = score;
        
        emit SustainabilityUpdated(shopId, oldScore, score);
    }
    
    /**
     * @dev Toggle shop active status
     * @param shopId Shop ID
     */
    function toggleShopStatus(uint256 shopId) external onlyShopOwner(shopId) {
        Shop storage shop = shops[shopId];
        shop.isActive = !shop.isActive;
        
        if (shop.isActive) {
            totalActiveShops++;
        } else {
            totalActiveShops--;
        }
        
        emit ShopStatusChanged(shopId, shop.isActive);
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Get shop details
     * @param shopId Shop ID
     * @return shop Shop information
     */
    function getShop(uint256 shopId) external view returns (Shop memory shop) {
        require(shopId < shopCounter, "Shop does not exist");
        return shops[shopId];
    }
    
    /**
     * @dev Get investor details
     * @param investorAddress Investor wallet address
     * @return investor Investor information
     */
    function getInvestor(address investorAddress) external view returns (Investor memory investor) {
        require(investors[investorAddress].isRegistered, "Investor not registered");
        return investors[investorAddress];
    }
    
    /**
     * @dev Get network statistics
     * @return stats Network statistics
     */
    function getNetworkStats() external view returns (NetworkStats memory stats) {
        uint256 totalScore = 0;
        uint256 activeShopCount = 0;
        
        for (uint256 i = 0; i < shopCounter; i++) {
            if (shops[i].isActive) {
                totalScore += shops[i].sustainabilityScore;
                activeShopCount++;
            }
        }
        
        uint256 avgScore = activeShopCount > 0 ? totalScore / activeShopCount : 0;
        
        return NetworkStats({
            totalShops: shopCounter,
            totalActiveShops: totalActiveShops,
            totalFunding: totalNetworkFunding,
            totalInvestors: totalRegisteredInvestors,
            averageSustainabilityScore: avgScore,
            totalTransactions: totalTransactions
        });
    }
    
    /**
     * @dev Get funding history for a shop
     * @param shopId Shop ID
     * @return transactions Array of funding transactions
     */
    function getFundingHistory(uint256 shopId) external view validShop(shopId) returns (FundingTransaction[] memory transactions) {
        return shopFunding[shopId];
    }
    
    /**
     * @dev Get sales history for a shop
     * @param shopId Shop ID
     * @return sales Array of sale amounts
     */
    function getSalesHistory(uint256 shopId) external view validShop(shopId) returns (uint256[] memory sales) {
        return shopSales[shopId];
    }
    
    /**
     * @dev Get shops funded by an investor
     * @param investorAddress Investor wallet address
     * @return shopIds Array of shop IDs
     */
    function getInvestorShops(address investorAddress) external view returns (uint256[] memory shopIds) {
        require(investors[investorAddress].isRegistered, "Investor not registered");
        return investorShops[investorAddress];
    }
    
    /**
     * @dev Get all active shops (paginated)
     * @param offset Starting index
     * @param limit Number of shops to return
     * @return shopIds Array of shop IDs
     */
    function getActiveShops(uint256 offset, uint256 limit) external view returns (uint256[] memory shopIds) {
        require(limit > 0 && limit <= 100, "Invalid limit");
        
        uint256[] memory activeShopIds = new uint256[](limit);
        uint256 count = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < shopCounter && count < limit; i++) {
            if (shops[i].isActive) {
                if (currentIndex >= offset) {
                    activeShopIds[count] = i;
                    count++;
                }
                currentIndex++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeShopIds[i];
        }
        
        return result;
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Emergency pause contract
     */
    function pauseContract() external onlyOwner {
        contractActive = false;
    }
    
    /**
     * @dev Resume contract operations
     */
    function resumeContract() external onlyOwner {
        contractActive = true;
    }
    
    /**
     * @dev Transfer contract ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Get category name as string
     * @param category Shop category enum
     * @return categoryName Category name
     */
    function getCategoryName(ShopCategory category) external pure returns (string memory categoryName) {
        if (category == ShopCategory.OrganicProduce) return "Organic Produce";
        if (category == ShopCategory.EcoCrafts) return "Eco-Crafts";
        if (category == ShopCategory.SolarKiosk) return "Solar Kiosk";
        if (category == ShopCategory.WasteUpcycling) return "Waste Upcycling";
        if (category == ShopCategory.AgroProcessing) return "Agro-Processing";
        return "Unknown";
    }
    
    /**
     * @dev Check if shop funding goal is met
     * @param shopId Shop ID
     * @return isFunded True if funding goal is met
     */
    function isShopFullyFunded(uint256 shopId) external view validShop(shopId) returns (bool isFunded) {
        Shop memory shop = shops[shopId];
        // Avoid strict equality - use safer bounds checking
        // Since MIN_FUNDING_AMOUNT > 0, any valid shop will have fundingNeeded > 0
        if (shop.fundingNeeded < MIN_FUNDING_AMOUNT) {
            return false; // Invalid or improperly initialized shop
        }
        // Safe comparison avoiding potential edge cases
        return shop.totalFunded >= shop.fundingNeeded;
    }
    
    /**
     * @dev Get funding progress percentage
     * @param shopId Shop ID
     * @return percentage Funding progress (0-100)
     */
    function getFundingProgress(uint256 shopId) external view validShop(shopId) returns (uint256 percentage) {
        Shop memory shop = shops[shopId];
        // Avoid strict equality - use safer bounds checking
        // Since MIN_FUNDING_AMOUNT > 0, any valid shop will have fundingNeeded > 0
        if (shop.fundingNeeded < MIN_FUNDING_AMOUNT) {
            return 0; // Invalid or improperly initialized shop
        }
        // Calculate progress with overflow protection
        if (shop.totalFunded >= shop.fundingNeeded) {
            return 100;
        }
        // Safe calculation that won't overflow
        uint256 progress = (shop.totalFunded * 100) / shop.fundingNeeded;
        return progress;
    }
    
    // =============================================================================
    // FALLBACK & RECEIVE
    // =============================================================================
    
    /**
     * @dev Fallback function - reject any direct payments
     */
    fallback() external payable {
        revert("Direct payments not allowed. Use GPS tokens via fundShop function.");
    }
    
    /**
     * @dev Receive function - reject any direct ETH transfers
     */
    receive() external payable {
        revert("Direct payments not allowed. Use GPS tokens via fundShop function.");
    }
    
    // =============================================================================
    // INTERNAL REWARD SYSTEM
    // =============================================================================
    
    /**
     * @dev Award bonus GPS tokens for funding activities
     * @param investor Investor address
     * @param fundingAmount Amount funded
     */
    function _awardFundingBonus(address investor, uint256 fundingAmount) internal {
        // Award 2% bonus tokens for funding
        uint256 bonusAmount = (fundingAmount * 2) / 100;
        
        try gpsToken.awardInvestorTokens(investor, bonusAmount) {
            // Bonus awarded successfully
        } catch {
            // Bonus award failed - continue without reverting the main transaction
        }
    }
    
    /**
     * @dev Award bonus GPS tokens for sales activities
     * @param shop Shop owner address
     * @param saleAmount Sale amount
     */
    function _awardSalesBonus(address shop, uint256 saleAmount) internal {
        try gpsToken.awardShopTokens(shop, saleAmount) {
            // Bonus awarded successfully
        } catch {
            // Bonus award failed - continue without reverting the main transaction
        }
    }
    
    // =============================================================================
    // GPS TOKEN UTILITY FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Get GPS token balance of an address
     * @param account Account to check
     */
    function getGPSBalance(address account) external view returns (uint256) {
        return gpsToken.balanceOf(account);
    }
    
    /**
     * @dev Get GPS token contract address
     */
    function getGPSTokenAddress() external view returns (address) {
        return address(gpsToken);
    }
    
    /**
     * @dev Convert GPS tokens to display format
     * @param amount Raw GPS token amount
     */
    function formatGPSAmount(uint256 amount) external pure returns (uint256) {
        return amount / 10**18;
    }
    
    /**
     * @dev Check if investor has sufficient GPS tokens for funding
     * @param investor Investor address
     * @param amount Required amount
     */
    function canFundWithGPS(address investor, uint256 amount) external view returns (bool) {
        return gpsToken.balanceOf(investor) >= amount && 
               gpsToken.allowance(investor, address(this)) >= amount;
    }
}
