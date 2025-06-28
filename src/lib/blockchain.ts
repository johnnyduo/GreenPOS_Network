import { config } from '../config';

// Maschain Network Configuration
export const MASCHAIN_CONFIG = {
  rpcUrl: config.maschain.rpcUrl,
  networkId: config.maschain.networkId,
  chainId: config.maschain.chainId,
  name: 'Maschain Mainnet',
  currency: {
    name: 'Mass',
    symbol: 'MASS',
    decimals: 18,
  },
  explorer: 'https://explorer.maschain.com',
} as const;

// Smart Contract Interfaces (Placeholder for future implementation)
export interface GreenTokenContract {
  address: string;
  abi: any[];
  methods: {
    transfer: (to: string, amount: bigint) => Promise<string>;
    balanceOf: (address: string) => Promise<bigint>;
    mint: (to: string, amount: bigint) => Promise<string>;
    burn: (amount: bigint) => Promise<string>;
  };
}

export interface FundingPoolContract {
  address: string;
  abi: any[];
  methods: {
    createPool: (shopId: string, targetAmount: bigint) => Promise<string>;
    contribute: (poolId: string, amount: bigint) => Promise<string>;
    withdraw: (poolId: string) => Promise<string>;
    getPoolInfo: (poolId: string) => Promise<PoolInfo>;
  };
}

export interface RevenueShareContract {
  address: string;
  abi: any[];
  methods: {
    distributeRevenue: (shopId: string, amount: bigint) => Promise<string>;
    claimRewards: (investorAddress: string) => Promise<string>;
    getInvestorShare: (investorAddress: string, shopId: string) => Promise<bigint>;
  };
}

// Types for blockchain data
export interface PoolInfo {
  id: string;
  shopId: string;
  targetAmount: bigint;
  currentAmount: bigint;
  contributors: string[];
  isActive: boolean;
  createdAt: number;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: bigint;
  gasUsed: bigint;
  status: 'pending' | 'confirmed' | 'failed';
}

// Utility functions for blockchain integration
export class MaschainUtils {
  static formatAmount(amount: bigint, decimals: number = 18): string {
    const divisor = BigInt(10 ** decimals);
    const quotient = amount / divisor;
    const remainder = amount % divisor;
    
    if (remainder === 0n) {
      return quotient.toString();
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');
    
    return trimmedRemainder.length > 0 
      ? `${quotient}.${trimmedRemainder}`
      : quotient.toString();
  }

  static parseAmount(amount: string, decimals: number = 18): bigint {
    const [whole, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole + paddedFraction);
  }

  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static shortenAddress(address: string, chars: number = 4): string {
    if (!this.isValidAddress(address)) return address;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  }

  static getExplorerUrl(hash: string, type: 'tx' | 'address' | 'block' = 'tx'): string {
    return `${MASCHAIN_CONFIG.explorer}/${type}/${hash}`;
  }
}

// Blockchain event types for future WebSocket integration
export interface BlockchainEvent {
  type: 'transaction' | 'funding' | 'revenue_share' | 'token_transfer';
  data: {
    hash: string;
    shopId?: string;
    amount?: bigint;
    from?: string;
    to?: string;
    timestamp: number;
  };
}

// Mock blockchain service (to be replaced with actual Web3 integration)
export class MockBlockchainService {
  private events: BlockchainEvent[] = [];

  async connectWallet(): Promise<string> {
    // Mock wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    return '0x1234567890123456789012345678901234567890';
  }

  async getBalance(_address: string): Promise<bigint> {
    // Mock balance check
    await new Promise(resolve => setTimeout(resolve, 500));
    return BigInt('1000000000000000000'); // 1 MASS
  }

  async sendTransaction(to: string, amount: bigint, _data?: string): Promise<string> {
    // Mock transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    const hash = `0x${Math.random().toString(16).slice(2)}`;
    
    this.events.push({
      type: 'transaction',
      data: {
        hash,
        amount,
        to,
        timestamp: Date.now(),
      },
    });
    
    return hash;
  }

  subscribeToEvents(callback: (event: BlockchainEvent) => void): () => void {
    const interval = setInterval(() => {
      if (this.events.length > 0) {
        const event = this.events.shift()!;
        callback(event);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}

// Export singleton instance for future use
export const blockchainService = new MockBlockchainService();
