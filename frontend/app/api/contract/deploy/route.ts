import type { NextApiRequest, NextApiResponse } from 'next';
import StellarSdk from 'stellar-sdk';
import fs from 'fs';
import path from 'path';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '';
const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

interface DeployResponse {
  success?: boolean;
  contractId?: string;
  transactionXdr?: string;
  error?: string;
  wasmHash?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeployResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signedTxXdr } = req.body;

    if (!signedTxXdr) {
      return res.status(400).json({ error: 'Signed transaction XDR required' });
    }

    // Submit signed transaction to Soroban RPC
    const response = await fetch(SOROBAN_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: {
          transaction: signedTxXdr,
        },
      }),
    });

    const result = await response.json();

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    console.log('✅ Contract deployed successfully!');
    console.log('Transaction hash:', result.result?.hash);

    return res.status(200).json({
      success: true,
      transactionXdr: result.result?.hash,
    });
  } catch (error) {
    console.error('Deployment error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Deployment failed',
    });
  }
}
