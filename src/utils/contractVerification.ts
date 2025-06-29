/**
 * Contract Verification Utility
 * Verifies that all contract connections are properly configured
 */

import { config } from '../config';
import { maschainService } from '../services/maschain';
import { smartContractService } from '../services/smartContract';

export interface ContractVerificationResult {
  success: boolean;
  results: {
    envConfig: boolean;
    gpsTokenAddress: boolean;
    networkContractAddress: boolean;
    serviceConnection: boolean;
    maschainService: boolean;
  };
  errors: string[];
  contractInfo: {
    networkContractAddress: string;
    gpsTokenAddress: string;
    explorerUrls: {
      networkContract: string;
      gpsToken: string;
    };
  };
}

export const verifyContractConnections = async (): Promise<ContractVerificationResult> => {
  const errors: string[] = [];
  const results = {
    envConfig: false,
    gpsTokenAddress: false,
    networkContractAddress: false,
    serviceConnection: false,
    maschainService: false,
  };

  try {
    // 1. Verify environment configuration
    console.log('🔍 Verifying environment configuration...');
    
    const networkContractAddress = config.maschain.contractAddress;
    const gpsTokenAddress = config.maschain.gpsTokenAddress;
    
    if (!networkContractAddress) {
      errors.push('VITE_MASCHAIN_CONTRACT_ADDRESS not configured');
    } else if (networkContractAddress === '0xd7751A299eb97C8e9aF8f378b0c9138851a267b9') {
      results.networkContractAddress = true;
      console.log('✅ Network contract address correctly configured');
    } else {
      errors.push(`Network contract address mismatch: ${networkContractAddress}`);
    }

    if (!gpsTokenAddress) {
      errors.push('VITE_GPS_TOKEN_ADDRESS not configured');
    } else if (gpsTokenAddress === '0xe979a16123F028EAcE7F33b4191E872b5E3695C0') {
      results.gpsTokenAddress = true;
      console.log('✅ GPS token address correctly configured');
    } else {
      errors.push(`GPS token address mismatch: ${gpsTokenAddress}`);
    }

    if (results.networkContractAddress && results.gpsTokenAddress) {
      results.envConfig = true;
    }

    // 2. Verify MASchain service connectivity
    console.log('🔍 Verifying MASchain service...');
    try {
      // Test basic service connectivity
      await maschainService.getAccountNonce('0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD');
      results.maschainService = true;
      console.log('✅ MASchain service connection successful');
    } catch (error) {
      errors.push(`MASchain service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3. Verify smart contract service
    console.log('🔍 Verifying smart contract service...');
    try {
      const tokenInfo = await smartContractService.getGPSTokenInfo();
      if (tokenInfo && tokenInfo.address.toLowerCase() === gpsTokenAddress.toLowerCase()) {
        results.serviceConnection = true;
        console.log('✅ Smart contract service connection successful');
      } else {
        errors.push('Smart contract service GPS token address mismatch');
      }
    } catch (error) {
      errors.push(`Smart contract service error: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }

    const contractInfo = {
      networkContractAddress: networkContractAddress || 'Not configured',
      gpsTokenAddress: gpsTokenAddress || 'Not configured',
      explorerUrls: {
        networkContract: `${config.maschain.explorerUrl}/address/${networkContractAddress}`,
        gpsToken: `${config.maschain.explorerUrl}/address/${gpsTokenAddress}`,
      },
    };

    const success = Object.values(results).every(result => result === true);

    return {
      success,
      results,
      errors,
      contractInfo,
    };

  } catch (error) {
    errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      success: false,
      results,
      errors,
      contractInfo: {
        networkContractAddress: config.maschain.contractAddress || 'Not configured',
        gpsTokenAddress: config.maschain.gpsTokenAddress || 'Not configured',
        explorerUrls: {
          networkContract: `${config.maschain.explorerUrl}/address/${config.maschain.contractAddress}`,
          gpsToken: `${config.maschain.explorerUrl}/address/${config.maschain.gpsTokenAddress}`,
        },
      },
    };
  }
};

/**
 * Quick verification for development/debugging
 */
export const quickVerify = () => {
  console.log('🚀 GreenPOS Contract Configuration:');
  console.log('📄 Network Contract:', config.maschain.contractAddress);
  console.log('🪙 GPS Token:', config.maschain.gpsTokenAddress);
  console.log('🔗 Explorer:', config.maschain.explorerUrl);
  console.log('🌐 RPC URL:', config.maschain.rpcUrl);
  
  if (config.maschain.contractAddress === '0xd7751A299eb97C8e9aF8f378b0c9138851a267b9') {
    console.log('✅ Using correct deployed GreenPOSNetworkEnhanced contract');
  } else {
    console.warn('⚠️ Contract address may be incorrect');
  }
};

// Auto-run verification in development
if (config.features.enableDevtools) {
  quickVerify();
}
