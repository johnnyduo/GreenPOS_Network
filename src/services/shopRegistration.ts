import { maschainService } from './maschain';
import { config } from '../config';
import { mockShops } from '../data/mockData';

export class ShopRegistrationService {
  private contractAddress: string;
  private walletAddress: string | null = null;
  private registeredShops: Set<string> = new Set();

  constructor() {
    this.contractAddress = config.maschain.contractAddress;
    this.loadRegisteredShops();
  }

  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  private loadRegisteredShops() {
    try {
      const stored = localStorage.getItem('greenpos_registered_shops');
      if (stored) {
        const shops = JSON.parse(stored);
        this.registeredShops = new Set(shops);
      }
    } catch (error) {
      console.warn('Failed to load registered shops:', error);
    }
  }

  private saveRegisteredShops() {
    try {
      const shops = Array.from(this.registeredShops);
      localStorage.setItem('greenpos_registered_shops', JSON.stringify(shops));
    } catch (error) {
      console.warn('Failed to save registered shops:', error);
    }
  }

  async registerMockShops(): Promise<boolean> {
    if (!this.walletAddress) {
      console.warn('Wallet not connected, skipping shop registration');
      return false;
    }

    console.log('🏪 Starting mock shop registration in blockchain...');
    let successCount = 0;
    
    for (const shop of mockShops) {
      try {
        if (this.registeredShops.has(shop.id)) {
          console.log(`✅ Shop ${shop.id} already registered, skipping`);
          continue;
        }

        // Convert shop category to enum number
        const categoryMap: { [key: string]: number } = {
          'Organic Produce': 0,
          'Eco-Crafts': 1,
          'Solar Kiosk': 2,
          'Waste Upcycling': 3,
          'Agro-Processing': 4
        };

        const categoryEnum = categoryMap[shop.category] ?? 0;
        
        // Convert funding needed to wei (18 decimals)
        const fundingNeededWei = (shop.fundingNeeded * Math.pow(10, 18)).toString();

        const registerABI = [
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "uint8",
                "name": "category",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "location",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "fundingNeeded",
                "type": "uint256"
              }
            ],
            "name": "registerShop",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "shopId",
                "type": "uint256"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ];

        const params = {
          wallet_options: {
            type: 'organisation' as const,
            address: this.walletAddress
          },
          method_name: 'registerShop',
          params: {
            name: shop.name,
            category: categoryEnum,
            location: shop.location,
            fundingNeeded: fundingNeededWei
          },
          contract_abi: registerABI
        };

        console.log(`🔄 Registering shop: ${shop.name} (${shop.id})`);
        const result = await maschainService.executeContract(this.contractAddress, params);
        
        if (result.transaction_hash || result.txHash) {
          this.registeredShops.add(shop.id);
          successCount++;
          console.log(`✅ Shop ${shop.name} registered successfully`);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`❌ Failed to register shop ${shop.name}:`, error.message);
        // Continue with other shops
      }
    }

    this.saveRegisteredShops();
    
    if (successCount > 0) {
      console.log(`🎉 Successfully registered ${successCount} shops in blockchain!`);
      return true;
    } else {
      console.warn('⚠️ No shops were registered');
      return false;
    }
  }

  async ensureShopsRegistered(): Promise<boolean> {
    // Check if we need to register shops
    if (this.registeredShops.size >= mockShops.length) {
      console.log('✅ All mock shops already registered');
      return true;
    }

    return await this.registerMockShops();
  }

  isShopRegistered(shopId: string): boolean {
    return this.registeredShops.has(shopId);
  }

  getRegisteredShopCount(): number {
    return this.registeredShops.size;
  }
}

export const shopRegistrationService = new ShopRegistrationService();
