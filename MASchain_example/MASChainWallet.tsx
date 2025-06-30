import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Activity,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useMASChain } from '../hooks/use-maschain';

interface MASChainWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MASChainWallet: React.FC<MASChainWalletProps> = ({ isOpen, onClose }) => {
  const {
    isConnected,
    balance,
    symbol,
    tokenBalances,
    walletAddress,
    networkStatus,
    transactions,
    loading,
    error,
    refresh,
    formatAddress,
    getExplorerUrl
  } = useMASChain();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(3);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            MASChain Wallet
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Malaysian Blockchain Infrastructure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Connection Status */}
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected && networkStatus.connected 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`} />
                <span className="text-sm text-slate-300">
                  {isConnected && networkStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-white !text-white' : ''}`} />
              </Button>
            </div>
            
            {networkStatus.blockNumber && (
              <div className="mt-2 text-xs text-slate-400">
                Block: {networkStatus.blockNumber.toLocaleString()}
              </div>
            )}
          </Card>

          {/* Wallet Info */}
          {isConnected && (
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white !text-white">
                      {formatAddress(walletAddress)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAddress)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">RET Balance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white !text-white">
                        {formatBalance(tokenBalances.RET)}
                      </span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        RET
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">RCC Balance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white !text-white">
                        {formatBalance(tokenBalances.RCC)}
                      </span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        RCC
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Transactions */}
          {isConnected && transactions.length > 0 && (
            <Card className="p-4 bg-slate-800/50 border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Recent Transactions</span>
              </div>
              
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                        <Zap className="w-3 h-3 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-300">
                          {formatAddress(tx.hash || tx.transactionHash)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {tx.timestamp && formatTimestamp(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800 text-slate-900 hover:text-slate-900 !text-slate-900 bg-slate-200 hover:bg-slate-300"
              onClick={() => window.open(getExplorerUrl(), '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2 text-slate-900 !text-slate-900" />
              Explorer
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800 text-slate-900 hover:text-slate-900 !text-slate-900 bg-slate-200 hover:bg-slate-300"
              onClick={() => window.open(import.meta.env.VITE_MASCHAIN_PORTAL_URL, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2 text-slate-900 !text-slate-900" />
              Portal
            </Button>
          </div>

          {/* Network Info */}
          <div className="text-xs text-slate-500 text-center">
            MASChain Testnet • Gasless Transactions Enabled
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
