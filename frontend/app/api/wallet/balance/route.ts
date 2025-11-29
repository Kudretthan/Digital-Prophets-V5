import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { publicKey, isTestnet } = await request.json();

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }

    // Try both networks - mainnet first, then testnet
    let horizonUrl = 'https://horizon.stellar.org';
    let response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    
    // If not found on mainnet and isTestnet flag is true, try testnet
    if (!response.ok && isTestnet) {
      horizonUrl = 'https://horizon-testnet.stellar.org';
      response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    }

    console.log(`[/api/wallet/balance] Fetching balance from: ${horizonUrl} for: ${publicKey} (isTestnet: ${isTestnet})`);

    if (!response.ok) {
      console.error(`Horizon API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          balance: 0,
          error: `Account not found or API error: ${response.status}`,
        },
        { status: 404 }
      );
    }

    const accountData = await response.json();
    
    // Get native XLM balance from balances array
    const xlmBalance = accountData.balances.find(
      (b: any) => b.asset_type === 'native'
    );

    const balance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;

    console.log('[/api/wallet/balance] Balance fetched:', balance, 'for:', publicKey);

    return NextResponse.json({
      success: true,
      publicKey,
      balance,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    
    // Return a default balance on error so the app doesn't break
    return NextResponse.json(
      {
        success: false,
        balance: 0,
        error: error?.message || 'Failed to fetch balance',
      },
      { status: 500 }
    );
  }
}
