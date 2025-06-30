// MASChain webhook handler for Vercel serverless functions
interface WebhookEvent {
  event: string;
  wallet?: string;
  data?: {
    transactionHash?: string;
    timestamp?: string;
    amount?: string;
    status?: string;
    contractAddress?: string;
    from?: string;
    to?: string;
    [key: string]: any;
  };
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event: WebhookEvent = req.body;
    
    // Log the event for debugging
    console.log('MASChain Webhook Event Received:', {
      event: event.event,
      wallet: event.wallet,
      timestamp: event.data?.timestamp,
      rawBody: JSON.stringify(req.body)
    });

    // Process different event types
    switch (event.event) {
      case 'transaction_confirmed':
        console.log('✅ Transaction confirmed:', event.data?.transactionHash);
        // Here you could trigger real-time updates to your frontend
        // or update a database with the transaction status
        break;
      
      case 'balance_changed':
        console.log('💰 Balance changed for wallet:', event.wallet);
        // Update user balance in real-time
        break;
      
      case 'contract_deployed':
        console.log('📜 Contract deployed:', event.data?.contractAddress);
        // Handle new contract deployment
        break;
      
      case 'token_transfer':
        console.log('💸 Token transfer:', event.data?.from, '->', event.data?.to);
        // Track token movements
        break;
      
      default:
        console.log('🔔 Received unknown event:', event.event);
    }

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      eventType: event.event,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false, 
      error: 'Webhook processing failed',
      timestamp: new Date().toISOString()
    });
  }
}
