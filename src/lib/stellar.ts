import * as StellarSdk from 'stellar-sdk';

// Stellar Network configuration
export const STELLAR_NETWORK = {
  TESTNET: 'https://horizon-testnet.stellar.org',
  MAINNET: 'https://horizon.stellar.org',
  NETWORK_PASSPHRASE_TESTNET: 'Test SDF Network ; September 2015',
  NETWORK_PASSPHRASE_MAINNET: 'Public Global Stellar Network ; September 2015',
};

// xlm Token contract details (example - use your actual token details)
export const xlm_TOKEN = {
  CODE: 'xlm',
  ISSUER: 'GAXN7H22EHZDGFTD2UXNW57QJHSOWQYQEHRYQKCRQ3OZRWOXMXVB3MZX', // Example issuer
  DECIMAL_PLACES: 7,
};

export class StellarService {
  private server: any;
  private networkPassphrase: string;

  constructor(isTestnet = true) {
    this.networkPassphrase = isTestnet
      ? STELLAR_NETWORK.NETWORK_PASSPHRASE_TESTNET
      : STELLAR_NETWORK.NETWORK_PASSPHRASE_MAINNET;
    const horizonUrl = isTestnet
      ? STELLAR_NETWORK.TESTNET
      : STELLAR_NETWORK.MAINNET;
    // Use the default export from stellar-sdk
    this.server = new (StellarSdk as any).Server(horizonUrl);
  }

  /**
   * Get account information
   */
  async getAccountInfo(publicKey: string) {
    try {
      const account = await this.server.loadAccount(publicKey);
      return {
        id: account.id,
        sequenceNumber: account.sequence,
        subentryCount: account.subentryCount,
        balances: account.balances,
      };
    } catch (error) {
      console.error('Error loading account:', error);
      throw error;
    }
  }

  /**
   * Get xlm token balance or fallback to XLM
   */
  async getxlmBalance(publicKey: string): Promise<number> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      // Try to find xlm token balance
      const xlmBalance = account.balances.find(
        (b: any) => b.asset_code === xlm_TOKEN.CODE && b.asset_issuer === xlm_TOKEN.ISSUER
      );
      
      if (xlmBalance) {
        return parseFloat(xlmBalance.balance);
      }
      
      // Fallback: return XLM balance if xlm not found
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
      if (xlmBalance) {
        return parseFloat(xlmBalance.balance);
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting xlm balance:', error);
      return 0;
    }
  }

  /**
   * Get native XLM balance
   */
  async getXLMBalance(publicKey: string): Promise<number> {
    try {
      const account = await this.server.loadAccount(publicKey);
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
      return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
    } catch (error) {
      console.error('Error getting XLM balance:', error);
      return 0;
    }
  }

  /**
   * Create a payment transaction
   */
  async createPaymentTransaction(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string
  ): Promise<any> {
    try {
      const account = await this.server.loadAccount(sourcePublicKey);
      const fee = await this.server.fetchBaseFee();

      const txBuilder = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: this.networkPassphrase,
      });

      const asset = new StellarSdk.Asset(xlm_TOKEN.CODE, xlm_TOKEN.ISSUER);

      txBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset,
          amount,
        })
      );

      txBuilder.setTimeout(30);

      return txBuilder;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  /**
   * Submit a transaction
   */
  async submitTransaction(signedXdr: string) {
    try {
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        this.networkPassphrase
      );
      const result = await this.server.submitTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(publicKey: string, limit = 10) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();
      return transactions.records;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Check trust line for xlm token
   */
  async checkTrustLine(publicKey: string): Promise<boolean> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances.some(
        (b: any) => b.asset_code === xlm_TOKEN.CODE && b.asset_issuer === xlm_TOKEN.ISSUER
      );
    } catch (error) {
      console.error('Error checking trust line:', error);
      return false;
    }
  }

  /**
   * Create trust line operation
   */
  createTrustLineOp(publicKey: string): any {
    const asset = new StellarSdk.Asset(xlm_TOKEN.CODE, xlm_TOKEN.ISSUER);
    return StellarSdk.Operation.changeTrust({
      asset,
      limit: '1000000',
    });
  }
}

export default StellarService;
