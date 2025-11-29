import { NextRequest, NextResponse } from 'next/server';
import StellarService from '@/lib/stellar';
import { FreighterWalletService } from '@/lib/freighter';

export async function POST(request: NextRequest) {
  try {
    const { sourcePublicKey, destinationPublicKey, amountxlm } =
      await request.json();

    // Create transaction
    const stellarService = new StellarService(true);
    const txBuilder = await stellarService.createPaymentTransaction(
      sourcePublicKey,
      destinationPublicKey,
      amountxlm.toString()
    );

    // Build transaction
    const tx = txBuilder.build();
    const xdr = tx.toEnvelope().toXDR('base64');

    // In production, sign with Freighter and submit
    // const signedXdr = await FreighterWalletService.signTransaction(xdr);
    // const result = await stellarService.submitTransaction(signedXdr);

    return NextResponse.json({
      success: true,
      transactionXDR: xdr,
      message: 'Transaction prepared. Sign with Freighter to submit.',
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
