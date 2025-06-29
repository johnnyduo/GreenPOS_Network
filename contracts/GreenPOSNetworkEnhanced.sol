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
}

/**
 * @title GreenPOS Network Enhanced - Optimized Professional MVP
 * @dev Streamlined contract for connecting rural shops with impact investors using GPS tokens
 * @author GreenPOS Team
 */
contract GreenPOSNetworkEnhanced {
    
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
        uint256 totalSales;
    }
    
    struct Investor {
        address wallet;
        string name;
        uint256 totalInvested;
        uint256[] fundedShops;
        bool isRegistered;
        uint256 rewardsClaimed;
    }
    
    struct FundingTransaction {
        uint256 shopId;
        address investor;
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }
    
    struct ImpactMetrics {
        uint256 totalCO2Saved;
        uint256 jobsCreated;
        uint256 communitiesServed;
        uint256 sustainableProducts;
    }
    
    IGreenPOSToken public immutable gpsToken;
    
    mapping(uint256 => Shop) public shops;
    mapping(address => Investor) public investors;
    mapping(uint256 => FundingTransaction[]) public shopFunding;
    mapping(address => bool) public verifiedShops;
    
    uint256 public shopCounter;
    uint256 public totalNetworkFunding;
    uint256 public totalActiveShops;
    uint256 public totalRegisteredInvestors;
    
    address public owner;
    bool public contractActive = true;
    bool private _locked;
    
    uint256 public constant MIN_FUNDING = 100 * 10**18;
    uint256 public constant MAX_FUNDING = 1_000_000 * 10**18;
    uint256 public constant FUNDING_REWARD_RATE = 2;
    uint256 public constant SALES_REWARD_RATE = 5;
    uint256 public constant MAX_SUSTAINABILITY_SCORE = 100;
    
    ImpactMetrics public globalImpact;
    
    event ShopRegistered(uint256 indexed shopId, address indexed owner, string name, ShopCategory category);
    event InvestorRegistered(address indexed investor, string name);
    event FundingReceived(uint256 indexed shopId, address indexed investor, uint256 amount, string purpose);
    event SaleRecorded(uint256 indexed shopId, uint256 amount, uint256 totalSales);
    event RewardPaid(address indexed recipient, uint256 amount, string reason);
    event ImpactUpdated(uint256 co2Saved, uint256 jobsCreated, uint256 communities);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
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
    
    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    constructor(address _gpsTokenAddress) {
        require(_gpsTokenAddress != address(0), "Invalid GPS token");
        owner = msg.sender;
        gpsToken = IGreenPOSToken(_gpsTokenAddress);
        _locked = false;
        globalImpact = ImpactMetrics(0, 0, 0, 0);
    }
    
    function registerShop(
        string memory name,
        ShopCategory category,
        string memory location,
        uint256 fundingNeeded
    ) external contractIsActive returns (uint256 shopId) {
        require(bytes(name).length > 0 && bytes(location).length > 0, "Empty input");
        require(fundingNeeded >= MIN_FUNDING && fundingNeeded <= MAX_FUNDING, "Invalid funding");
        
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
            registeredAt: block.timestamp,
            totalSales: 0
        });
        
        totalActiveShops++;
        emit ShopRegistered(shopId, msg.sender, name, category);
    }
    
    function registerInvestor(string memory name) external contractIsActive {
        require(bytes(name).length > 0 && !investors[msg.sender].isRegistered, "Invalid registration");
        
        investors[msg.sender] = Investor({
            wallet: msg.sender,
            name: name,
            totalInvested: 0,
            fundedShops: new uint256[](0),
            isRegistered: true,
            rewardsClaimed: 0
        });
        
        totalRegisteredInvestors++;
        emit InvestorRegistered(msg.sender, name);
    }
    
    function fundShop(
        uint256 shopId,
        uint256 amount,
        string memory purpose
    ) external contractIsActive validShop(shopId) nonReentrant {
        require(amount > 0 && bytes(purpose).length > 0, "Invalid input");
        require(investors[msg.sender].isRegistered, "Not registered");
        
        Shop storage shop = shops[shopId];
        require(shop.totalFunded < shop.fundingNeeded, "Fully funded");
        require(gpsToken.balanceOf(msg.sender) >= amount && 
                gpsToken.allowance(msg.sender, address(this)) >= amount, "Insufficient tokens");
        
        // EFFECTS: Update ALL state variables BEFORE external calls
        uint256 bonus = (amount * FUNDING_REWARD_RATE) / 100;
        
        // Update shop and investor state
        shop.totalFunded += amount;
        investors[msg.sender].totalInvested += amount;
        totalNetworkFunding += amount;
        
        // Record funding transaction
        shopFunding[shopId].push(FundingTransaction({
            shopId: shopId,
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose
        }));
        
        // Add to funded shops if new
        bool found = false;
        uint256[] storage fundedShops = investors[msg.sender].fundedShops;
        for (uint256 i = 0; i < fundedShops.length; i++) {
            if (fundedShops[i] == shopId) {
                found = true;
                break;
            }
        }
        if (!found) fundedShops.push(shopId);
        
        // Update impact metrics
        globalImpact.totalCO2Saved += amount / 1000;
        globalImpact.jobsCreated += 1;
        
        // Emit events before external calls
        emit FundingReceived(shopId, msg.sender, amount, purpose);
        emit ImpactUpdated(globalImpact.totalCO2Saved, globalImpact.jobsCreated, globalImpact.communitiesServed);
        
        // INTERACTIONS: All external calls at the very end, NO state changes after
        require(gpsToken.transferFrom(msg.sender, shop.owner, amount), "Transfer failed");
        
        // Award bonus with NO state changes in catch block
        bool bonusSuccess = false;
        try gpsToken.awardInvestorTokens(msg.sender, bonus) {
            bonusSuccess = true;
        } catch {
            // Do nothing - no state changes after external calls
        }
        
        // Only update rewards if bonus was successful
        if (bonusSuccess) {
            investors[msg.sender].rewardsClaimed += bonus;
            emit RewardPaid(msg.sender, bonus, "Bonus");
        }
    }
    
    function recordSale(uint256 shopId, uint256 amount) 
        external contractIsActive onlyShopOwner(shopId) nonReentrant {
        require(amount > 0, "Zero amount");
        
        // EFFECTS: Update ALL state variables BEFORE external calls
        uint256 bonus = (amount * SALES_REWARD_RATE) / 100;
        
        Shop storage shop = shops[shopId];
        shop.revenue += amount;
        shop.totalSales++;
        
        // Update impact metrics
        globalImpact.sustainableProducts += 1;
        
        // Emit events before external calls
        emit SaleRecorded(shopId, amount, shop.totalSales);
        emit ImpactUpdated(globalImpact.totalCO2Saved, globalImpact.jobsCreated, globalImpact.communitiesServed);
        
        // INTERACTIONS: External calls at the end, NO state changes after
        bool bonusSuccess = false;
        try gpsToken.awardInvestorTokens(msg.sender, bonus) {
            bonusSuccess = true;
        } catch {
            // Do nothing - no state changes after external calls
        }
        
        // Only update rewards if bonus was successful
        if (bonusSuccess) {
            investors[msg.sender].rewardsClaimed += bonus;
            emit RewardPaid(msg.sender, bonus, "Bonus");
        }
    }
    
    function updateSustainabilityScore(uint256 shopId, uint256 score) 
        external contractIsActive onlyShopOwner(shopId) {
        require(score <= MAX_SUSTAINABILITY_SCORE, "Score > 100");
        shops[shopId].sustainabilityScore = score;
        globalImpact.totalCO2Saved += score * 10;
        emit ImpactUpdated(globalImpact.totalCO2Saved, globalImpact.jobsCreated, globalImpact.communitiesServed);
    }
    
    function verifyShop(uint256 shopId) external onlyOwner validShop(shopId) {
        verifiedShops[shops[shopId].owner] = true;
    }
    
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
        
        // Use safe bounds checking instead of strict equality
        if (shop.fundingNeeded < MIN_FUNDING) return 0;
        
        // Safe calculation with overflow protection
        uint256 progress = (shop.totalFunded * 100) / shop.fundingNeeded;
        return progress > 100 ? 100 : progress;
    }
    
    function getGlobalImpact() external view returns (ImpactMetrics memory) {
        return globalImpact;
    }
    
    function getGPSBalance(address account) external view returns (uint256) {
        return gpsToken.balanceOf(account);
    }
    
    function getGPSTokenAddress() external view returns (address) {
        return address(gpsToken);
    }
    
    function isShopVerified(address shopOwner) external view returns (bool) {
        return verifiedShops[shopOwner];
    }
    
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
}
