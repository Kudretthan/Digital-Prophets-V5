import { NextRequest, NextResponse } from 'next/server';
import StellarService, { xlm_TOKEN } from '@/lib/stellar';

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json();

    const stellarService = new StellarService(true); // testnet
    const balance = await stellarService.getxlmBalance(publicKey);
    const hasTrustLine = await stellarService.checkTrustLine(publicKey);

    return NextResponse.json({
      publicKey,
      balance,
      hasTrustLine,
      xlmToken: {
        code: xlm_TOKEN.CODE,
        issuer: xlm_TOKEN.ISSUER,
      },
    });
  } catch (error) {
    console.error('Error checking wallet:', error);
    return NextResponse.json(
      { error: 'Failed to check wallet' },
      { status: 500 }
    );
  }
}
