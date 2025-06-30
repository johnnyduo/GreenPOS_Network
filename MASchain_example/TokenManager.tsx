import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';
import { masChainService } from '../lib/maschain';
import { Copy, Coins, Send, CheckCircle, Eye, Loader2 } from 'lucide-react';

interface TokenBalance {
  contractAddress: string;
  balance: string;
  symbol: string;
  name?: string;
}

interface SuccessModalData {
  isOpen: boolean;
  title: string;
  message: string;
  transactionHash?: string;
  explorerUrl?: string;
  amount?: string;
  symbol?: string;
  action?: string;
}

export const TokenManager: React.FC = () => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingAfterMint, setRefreshingAfterMint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<SuccessModalData>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Deployed Ralos token contracts on MASChain
  const ralosTokens = [
    {
      name: 'Ralos Energy Token',
      symbol: 'RET',
      contractAddress: import.meta.env.VITE_RET_CONTRACT_ADDRESS || '0x900d0104B5a7bA5944EA437Bee28Cd60fB858b4D',
      description: 'Energy trading tokens for solar asset investments'
    },
    {
      name: 'Ralos Carbon Credits',
      symbol: 'RCC',
      contractAddress: import.meta.env.VITE_RCC_CONTRACT_ADDRESS || '0xf537aCE1F15da1a1Eb0b14199ed059162474Dc4F',
      description: 'Carbon credit certificates for environmental impact'
    }
  ];

  // Load token balances
  const loadTokenBalances = async () => {
    setLoading(true);
    try {
      const balances = await Promise.all(
        ralosTokens.map(async (token) => {
          const balance = await masChainService.getTokenBalance(token.contractAddress);
          return {
            contractAddress: token.contractAddress,
            balance: balance.balance,
            symbol: token.symbol,
            name: token.name
          };
        })
      );
      setTokenBalances(balances);
    } catch (err) {
      setError('Failed to load token balances');
    } finally {
      setLoading(false);
    }
  };

  // Quick mint function for deployer wallet
  const mintToDeployer = async (tokenContract: string, symbol: string, amount: string = '1') => {
    const deployerAddress = import.meta.env.VITE_MASCHAIN_WALLET_ADDRESS;
    if (!deployerAddress) {
      setError('Deployer wallet address not configured');
      return;
    }

    if (!tokenContract) {
      setError(`${symbol} contract address not configured`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`🪙 Minting ${amount} ${symbol} tokens...`, {
        to: deployerAddress,
        amount: amount,
        contractAddress: tokenContract
      });

      const result = await masChainService.mintTokens({
        to: deployerAddress,
        amount: amount,
        contractAddress: tokenContract
      });
      
      console.log('🎉 Mint successful:', result);
      
      if (result.transactionHash) {
        const explorerUrl = result.explorerUrl || `${import.meta.env.VITE_MASCHAIN_EXPLORER_URL}/${result.transactionHash}`;
        
        console.log('🌐 View transaction:', explorerUrl);

        // Show success modal
        showSuccessModal(
          '🎉 Quick Mint Successful!',
          `${amount} ${symbol} tokens have been minted to your deployer wallet and confirmed on the blockchain.`,
          result.transactionHash,
          explorerUrl,
          amount,
          symbol,
          'Quick Mint'
        );
      } else {
        setSuccess(`✅ ${amount} ${symbol} tokens minted successfully! (Transaction pending)`);
      }
      
      // Reload balances after minting with delay for blockchain processing
      // Try multiple times with increasing delays to handle blockchain latency
      const refreshBalances = async (attempt = 1, maxAttempts = 3) => {
        try {
          setRefreshingAfterMint(true);
          await loadTokenBalances();
          console.log(`✅ Balance refresh successful on attempt ${attempt}`);
          setRefreshingAfterMint(false);
        } catch (error) {
          console.warn(`⚠️ Balance refresh attempt ${attempt} failed:`, error);
          if (attempt < maxAttempts) {
            const nextDelay = attempt * 2000; // 2s, 4s, 6s
            console.log(`🔄 Retrying balance refresh in ${nextDelay}ms...`);
            setTimeout(() => refreshBalances(attempt + 1, maxAttempts), nextDelay);
          } else {
            setRefreshingAfterMint(false);
          }
        }
      };
      
      // Initial delay for blockchain processing, then start refresh attempts
      setTimeout(() => refreshBalances(), 3000);
    } catch (err) {
      console.error(`❌ Failed to mint ${symbol} tokens:`, err);
      
      // Check if it's a total supply error
      if (err.toString().includes('total supply reached')) {
        setError(`Cannot mint ${symbol} tokens: Total supply limit reached. The token contract may have reached its maximum supply.`);
      } else {
        setError(`Failed to mint ${symbol} tokens: ${err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Show success modal with transaction details
  const showSuccessModal = (
    title: string,
    message: string,
    transactionHash?: string,
    explorerUrl?: string,
    amount?: string,
    symbol?: string,
    action?: string
  ) => {
    setSuccessModal({
      isOpen: true,
      title,
      message,
      transactionHash,
      explorerUrl,
      amount,
      symbol,
      action
    });
  };

  // Close success modal
  const closeSuccessModal = () => {
    setSuccessModal({
      isOpen: false,
      title: '',
      message: ''
    });
  };

  useEffect(() => {
    loadTokenBalances();
  }, []);

  return (
    <div className="space-y-6">
      {/* Token Balances */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Coins className="h-5 w-5" />
            Ralos Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="text-left">
          <div className="grid gap-4 text-left">
            {ralosTokens.map((token, index) => {
              const tokenBalance = tokenBalances.find(t => t.contractAddress === token.contractAddress);
              const isLoadingThisToken = (loading && (!tokenBalance || tokenBalances.length === 0)) || refreshingAfterMint;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800">
                  <div className="text-left">
                    <div className="font-semibold text-white text-left">{token.name} ({token.symbol})</div>
                    <div className="text-sm text-gray-400 text-left">{token.description}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {masChainService.formatAddress(token.contractAddress)}
                      <button 
                        onClick={() => copyToClipboard(token.contractAddress)}
                        className="hover:text-blue-400 text-gray-500"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    {isLoadingThisToken ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <Skeleton className="h-8 w-20 bg-gray-700" />
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-lg border-gray-600 text-white bg-gray-800">
                        {parseFloat(tokenBalance?.balance || '0').toFixed(2)} {token.symbol}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={loadTokenBalances} 
            variant="outline" 
            className="w-full mt-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={loading || refreshingAfterMint}
          >
            {loading || refreshingAfterMint ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {refreshingAfterMint ? 'Updating after mint...' : 'Refreshing...'}
              </>
            ) : (
              'Refresh Balances'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions - Moved to top for visibility */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="text-sm text-gray-400 mb-2">
              Quick mint tokens to deployer wallet:
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="default"
                onClick={() => mintToDeployer(import.meta.env.VITE_RET_CONTRACT_ADDRESS, 'RET', '1')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                Mint 1 RET Token
              </Button>
              
              <Button 
                variant="default"
                onClick={() => mintToDeployer(import.meta.env.VITE_RCC_CONTRACT_ADDRESS, 'RCC', '1')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                Mint 1 RCC Token
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/20 text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-500/20 text-green-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Success Modal - Transaction Details */}
      {/* Success Modal */}
      <Dialog open={successModal.isOpen} onOpenChange={closeSuccessModal}>
        <DialogContent className="max-w-md mx-auto p-0 rounded-xl shadow-2xl bg-gray-900 border-gray-700">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-xl font-bold text-center text-white">
                {successModal.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-6 space-y-4">
              <p className="text-gray-300 text-center leading-relaxed">
                {successModal.message}
              </p>
              
              {/* Transaction Details */}
              {successModal.transactionHash && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="space-y-3">
                    {/* Amount & Symbol */}
                    {successModal.amount && successModal.symbol && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Amount:</span>
                        <Badge variant="outline" className="text-lg px-3 py-1 border-gray-600 text-white bg-gray-800">
                          {successModal.amount} {successModal.symbol}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Type */}
                    {successModal.action && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Action:</span>
                        <Badge variant="default" className="bg-green-600 text-white">
                          {successModal.action}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Transaction Hash */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-300">Transaction Hash:</span>
                      <div className="flex items-center space-x-2 bg-gray-700 rounded p-2">
                        <code className="text-xs text-gray-200 flex-1 font-mono break-all">
                          {successModal.transactionHash}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(successModal.transactionHash || '');
                          }}
                          className="h-8 w-8 p-0 hover:bg-gray-600 text-gray-300"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {successModal.explorerUrl && (
                <Button 
                  onClick={() => {
                    window.open(successModal.explorerUrl, '_blank');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View on MASChain Explorer
                </Button>
              )}
              
              <Button 
                onClick={closeSuccessModal} 
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
