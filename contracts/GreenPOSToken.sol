// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GreenPOS Token (GPS)
 * @dev Custom ERC20 token for the GreenPOS ecosystem
 * @author GreenPOS Team
 */
contract GreenPOSToken is ERC20, ERC20Burnable, Ownable {
    
    // =============================================================================
    // CONSTANTS
    // =============================================================================
    
    // Token Details
    uint8 public constant DECIMALS = 18;
    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10**DECIMALS; // 10 Million GPS
    
    // Initial Distribution
    uint256 public constant ECOSYSTEM_FUND = 4_000_000 * 10**DECIMALS; // 40% - For shop funding
    uint256 public constant INVESTOR_REWARDS = 2_000_000 * 10**DECIMALS; // 20% - Investor incentives
    uint256 public constant DEVELOPMENT_FUND = 2_000_000 * 10**DECIMALS; // 20% - Development & operations
    uint256 public constant COMMUNITY_REWARDS = 1_500_000 * 10**DECIMALS; // 15% - Community incentives
    uint256 public constant RESERVE_FUND = 500_000 * 10**DECIMALS; // 5% - Emergency reserve
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public blacklisted;
    
    bool public transfersEnabled;
    bool public mintingEnabled;
    
    address public ecosystemWallet;
    address public treasuryWallet;
    address public communityWallet;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event AccountBlacklisted(address indexed account);
    event AccountWhitelisted(address indexed account);
    event TransfersEnabled();
    event TransfersDisabled();
    event MintingEnabled();
    event MintingDisabled();
    event WalletUpdated(string walletType, address indexed newWallet);
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    modifier transfersAllowed() {
        require(transfersEnabled, "Transfers are disabled");
        _;
    }
    
    modifier mintingAllowed() {
        require(mintingEnabled, "Minting is disabled");
        _;
    }
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(
        address _ecosystemWallet,
        address _treasuryWallet,
        address _communityWallet
    ) ERC20("GreenPOS Token", "GPS") Ownable(msg.sender) {
        require(_ecosystemWallet != address(0), "Invalid ecosystem wallet");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_communityWallet != address(0), "Invalid community wallet");
        
        ecosystemWallet = _ecosystemWallet;
        treasuryWallet = _treasuryWallet;
        communityWallet = _communityWallet;
        
        // Initial distribution
        _mint(_ecosystemWallet, ECOSYSTEM_FUND);
        _mint(_treasuryWallet, DEVELOPMENT_FUND + RESERVE_FUND);
        _mint(_communityWallet, COMMUNITY_REWARDS);
        _mint(owner(), INVESTOR_REWARDS); // Owner can distribute to investors
        
        // Enable transfers and minting by default
        transfersEnabled = true;
        mintingEnabled = true;
        
        // Contract owner is authorized minter by default
        authorizedMinters[owner()] = true;
    }
    
    // =============================================================================
    // CORE FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Mint new tokens (only authorized minters)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyMinter mintingAllowed {
        require(to != address(0), "Cannot mint to zero address");
        require(!blacklisted[to], "Cannot mint to blacklisted address");
        _mint(to, amount);
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyMinter mintingAllowed {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 100, "Too many recipients");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            require(!blacklisted[recipients[i]], "Cannot mint to blacklisted address");
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Award tokens for ecosystem participation
     * @param shop Shop address
     * @param amount Reward amount
     */
    function awardShopTokens(address shop, uint256 amount) external onlyMinter {
        require(shop != address(0), "Invalid shop address");
        require(!blacklisted[shop], "Shop is blacklisted");
        _mint(shop, amount);
    }
    
    /**
     * @dev Award tokens for investor participation
     * @param investor Investor address
     * @param amount Reward amount
     */
    function awardInvestorTokens(address investor, uint256 amount) external onlyMinter {
        require(investor != address(0), "Invalid investor address");
        require(!blacklisted[investor], "Investor is blacklisted");
        _mint(investor, amount);
    }
    
    // =============================================================================
    // TRANSFER FUNCTIONS WITH RESTRICTIONS
    // =============================================================================
    
    function transfer(
        address to,
        uint256 amount
    ) public override transfersAllowed notBlacklisted(msg.sender) notBlacklisted(to) returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override transfersAllowed notBlacklisted(from) notBlacklisted(to) returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Add authorized minter
     * @param minter Address to authorize
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove authorized minter
     * @param minter Address to remove
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Blacklist an account
     * @param account Account to blacklist
     */
    function blacklistAccount(address account) external onlyOwner {
        require(account != address(0), "Cannot blacklist zero address");
        require(account != owner(), "Cannot blacklist owner");
        blacklisted[account] = true;
        emit AccountBlacklisted(account);
    }
    
    /**
     * @dev Remove account from blacklist
     * @param account Account to whitelist
     */
    function whitelistAccount(address account) external onlyOwner {
        blacklisted[account] = false;
        emit AccountWhitelisted(account);
    }
    
    /**
     * @dev Enable token transfers
     */
    function enableTransfers() external onlyOwner {
        transfersEnabled = true;
        emit TransfersEnabled();
    }
    
    /**
     * @dev Disable token transfers (emergency only)
     */
    function disableTransfers() external onlyOwner {
        transfersEnabled = false;
        emit TransfersDisabled();
    }
    
    /**
     * @dev Enable token minting
     */
    function enableMinting() external onlyOwner {
        mintingEnabled = true;
        emit MintingEnabled();
    }
    
    /**
     * @dev Disable token minting
     */
    function disableMinting() external onlyOwner {
        mintingEnabled = false;
        emit MintingDisabled();
    }
    
    /**
     * @dev Update ecosystem wallet
     * @param newWallet New wallet address
     */
    function updateEcosystemWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        ecosystemWallet = newWallet;
        emit WalletUpdated("ecosystem", newWallet);
    }
    
    /**
     * @dev Update treasury wallet
     * @param newWallet New wallet address
     */
    function updateTreasuryWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        treasuryWallet = newWallet;
        emit WalletUpdated("treasury", newWallet);
    }
    
    /**
     * @dev Update community wallet
     * @param newWallet New wallet address
     */
    function updateCommunityWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        communityWallet = newWallet;
        emit WalletUpdated("community", newWallet);
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Get token details
     */
    function getTokenInfo() external pure returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply
    ) {
        return ("GreenPOS Token", "GPS", DECIMALS, TOTAL_SUPPLY);
    }
    
    /**
     * @dev Check if account is authorized minter
     * @param account Account to check
     */
    function isMinter(address account) external view returns (bool) {
        return authorizedMinters[account];
    }
    
    /**
     * @dev Check if account is blacklisted
     * @param account Account to check
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklisted[account];
    }
    
    /**
     * @dev Get contract status
     */
    function getContractStatus() external view returns (
        bool transfersStatus,
        bool mintingStatus,
        address ecosystem,
        address treasury,
        address community
    ) {
        return (
            transfersEnabled,
            mintingEnabled,
            ecosystemWallet,
            treasuryWallet,
            communityWallet
        );
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Convert amount to display format
     * @param amount Raw token amount
     */
    function toDisplayAmount(uint256 amount) external pure returns (uint256) {
        return amount / 10**DECIMALS;
    }
    
    /**
     * @dev Convert display amount to raw format
     * @param displayAmount Display amount
     */
    function fromDisplayAmount(uint256 displayAmount) external pure returns (uint256) {
        return displayAmount * 10**DECIMALS;
    }
}
