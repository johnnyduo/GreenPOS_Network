import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Transaction hash management utilities
export interface AssetTransactionRecord {
  assetId: string;
  transactionHash: string;
  registrationDate: number;
  assetName: string;
  walletAddress: string;
}

export const getStoredTransactions = (): AssetTransactionRecord[] => {
  try {
    const stored = localStorage.getItem("ralos_asset_transactions");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load stored transactions:", error);
    return [];
  }
};

export const storeTransaction = (record: AssetTransactionRecord): void => {
  try {
    const existing = getStoredTransactions();
    const updated = existing.filter((r) => r.assetId !== record.assetId); // Remove existing record for same asset
    updated.push(record);
    localStorage.setItem("ralos_asset_transactions", JSON.stringify(updated));
    console.log("✅ Transaction stored:", record);
  } catch (error) {
    console.error("Failed to store transaction:", error);
  }
};

export const getTransactionForAsset = (assetId: string | number): string | null => {
  const transactions = getStoredTransactions();
  const record = transactions.find((t) => t.assetId === assetId.toString());
  return record?.transactionHash || null;
};

// Enhanced transaction hash retrieval with API fallback
export const getTransactionForAssetWithAPI = async (assetId: string | number, masChainService?: any): Promise<string | null> => {
  // First try localStorage
  const localTx = getTransactionForAsset(assetId);
  if (localTx) {
    return localTx;
  }
  
  // If no MASChain service provided, just return null
  if (!masChainService) {
    return null;
  }
  
  // Try to get from API if not in localStorage
  try {
    const apiTransactions = await masChainService.getAssetRegistrationTransactions();
    const apiRecord = apiTransactions.find((t: any) => t.assetId === assetId.toString());
    
    if (apiRecord?.transactionHash) {
      // Store in localStorage for future use
      storeTransaction({
        assetId: assetId.toString(),
        transactionHash: apiRecord.transactionHash,
        registrationDate: Date.now(),
        assetName: `Asset ${assetId}`,
        walletAddress: 'unknown'
      });
      
      return apiRecord.transactionHash;
    }
  } catch (error) {
    console.warn('Could not fetch transaction from API:', error);
  }
  
  return null;
};

// Explorer URL builders
export const buildTransactionExplorerUrl = (hash: string): string => {
  return `${import.meta.env.VITE_MASCHAIN_EXPLORER_URL}/${hash}`;
};

export const buildContractExplorerUrl = (address: string): string => {
  return `${import.meta.env.VITE_MASCHAIN_EXPLORER_URL}/${address}`;
};

// Clear all stored transactions (for testing/debugging)
export const clearStoredTransactions = (): void => {
  try {
    localStorage.removeItem("ralos_asset_transactions");
    console.log("✅ Cleared all stored transactions");
  } catch (error) {
    console.error("Failed to clear stored transactions:", error);
  }
};

// Debug function to log current localStorage transaction data
export const debugStoredTransactions = (): void => {
  try {
    const stored = getStoredTransactions();
    console.log("🔍 Current localStorage transaction data:");
    console.log("Total stored transactions:", stored.length);
    stored.forEach((record, index) => {
      console.log(`${index + 1}. Asset ID: ${record.assetId}, TxHash: ${record.transactionHash}, Name: ${record.assetName}`);
    });

    if (stored.length === 0) {
      console.log("❌ No transactions found in localStorage");
    }
  } catch (error) {
    console.error("Failed to debug stored transactions:", error);
  }
};

// Debug function to populate sample transaction hashes for testing
export const populateSampleTransactionHashes = (): void => {
  console.log('🧪 Populating sample transaction hashes for testing...');
  
  const sampleTransactions = [
    {
      assetId: "1",
      transactionHash: "0x6c51d3d3417c675495f18478c2824326bfc74e15fc9e24239fe60e05c7e79ffc",
      registrationDate: Date.now() - 86400000, // 1 day ago
      assetName: "Ella_Home",
      walletAddress: "0x7abC6D76A53127CD824F6..."
    },
    {
      assetId: "2", 
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      registrationDate: Date.now() - 172800000, // 2 days ago
      assetName: "Commercial Solar Park",
      walletAddress: "0x7abC6D76A53127CD824F6..."
    }
  ];
  
  // Get existing transactions
  const existing = getStoredTransactions();
  
  // Add sample transactions if they don't exist
  sampleTransactions.forEach(sample => {
    const exists = existing.find(t => t.assetId === sample.assetId);
    if (!exists) {
      storeTransaction(sample);
      console.log('✅ Added sample transaction for asset', sample.assetId, ':', sample.transactionHash);
    }
  });
  
  console.log('🧪 Sample transaction hashes populated');
};