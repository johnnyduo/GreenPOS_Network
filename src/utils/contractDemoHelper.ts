/**
 * Contract Demo Data Utility
 * Helps populate test data for development and demo purposes
 */

import { smartContractService } from '../services/smartContractLite';
import { config } from '../config';

export interface DemoShop {
  name: string;
  category: number;
  location: string;
  fundingNeeded: number;
  sustainabilityScore: number;
}

export const demoShops: DemoShop[] = [
  {
    name: 'Green Valley Organic Farm',
    category: 0, // Organic Produce
    location: 'Northern Thailand',
    fundingNeeded: 5000,
    sustainabilityScore: 85
  },
  {
    name: 'Bamboo Craft Workshop',
    category: 1, // Eco-Crafts
    location: 'Central Vietnam',
    fundingNeeded: 3500,
    sustainabilityScore: 78
  },
  {
    name: 'Solar Power Kiosk',
    category: 2, // Solar Kiosk
    location: 'Kuala Lumpur, Malaysia',
    fundingNeeded: 4200,
    sustainabilityScore: 92
  }
];

export class ContractDemoHelper {
  /**
   * Check if contract has any data
   */
  static async hasData(): Promise<boolean> {
    try {
      const stats = await smartContractService.getNetworkStats();
      return stats.totalShops > 0;
    } catch (error) {
      console.error('Error checking contract data:', error);
      return false;
    }
  }

  /**
   * Get contract status for debugging
   */
  static async getContractStatus(): Promise<{
    address: string;
    hasData: boolean;
    isConnected: boolean;
    stats?: any;
  }> {
    const address = config.maschain.contractAddress;
    let hasData = false;
    let isConnected = false;
    let stats = null;

    try {
      stats = await smartContractService.getNetworkStats();
      isConnected = true;
      hasData = stats.totalShops > 0;
    } catch (error) {
      console.error('Contract status check failed:', error);
    }

    return {
      address,
      hasData,
      isConnected,
      stats
    };
  }

  /**
   * Log contract status for debugging
   */
  static async logStatus(): Promise<void> {
    console.log('🔍 Contract Demo Helper - Status Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const status = await this.getContractStatus();
    
    console.log(`📄 Contract Address: ${status.address}`);
    console.log(`🔗 Connected: ${status.isConnected ? '✅' : '❌'}`);
    console.log(`📊 Has Data: ${status.hasData ? '✅' : '❌'}`);
    
    if (status.stats) {
      console.log('📈 Current Stats:');
      console.log(`   • Total Shops: ${status.stats.totalShops}`);
      console.log(`   • Active Shops: ${status.stats.totalActiveShops}`);
      console.log(`   • Total Funding: ${status.stats.totalFunding}`);
      console.log(`   • Total Investors: ${status.stats.totalInvestors}`);
      console.log(`   • Avg Sustainability: ${status.stats.averageSustainabilityScore}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Suggest next steps based on contract status
   */
  static async getSuggestedActions(): Promise<string[]> {
    const status = await this.getContractStatus();
    const suggestions: string[] = [];

    if (!status.isConnected) {
      suggestions.push('Check MASchain network connectivity');
      suggestions.push('Verify contract address is correct');
      suggestions.push('Check API credentials');
    } else if (!status.hasData) {
      suggestions.push('Contract is deployed but empty');
      suggestions.push('Register some shops to populate data');
      suggestions.push('Add investors to see full functionality');
      suggestions.push('Demo mode will show mock data until real data is added');
    } else {
      suggestions.push('Contract has data and is working properly');
      suggestions.push('You can now test funding and transactions');
    }

    return suggestions;
  }
}

// Auto-run status check in development
if (config.features.enableDevtools) {
  setTimeout(() => {
    ContractDemoHelper.logStatus();
  }, 2000); // Delay to allow services to initialize
}

export default ContractDemoHelper;
