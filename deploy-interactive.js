#!/usr/bin/env node

/**
 * Interactive Soroban Contract Deployment Tool
 * Guides user through deployment process step by step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ADMIN_ADDRESS = 'GBJPVNGQEJAGJUPY3FQUXNHJOPSDT7VY4ELWG4NGX6MV227I3QI27GC3';
const WASM_FILE = path.join(__dirname, 'contracts', 'target', 'wasm32-unknown-unknown', 'release', 'prediction_market.wasm');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 Soroban Contract Deployment Interactive Tool 🚀          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Check WASM file
  if (!fs.existsSync(WASM_FILE)) {
    console.error('❌ WASM dosyası bulunamadı:', WASM_FILE);
    process.exit(1);
  }
  const wasmSize = fs.statSync(WASM_FILE).size;
  console.log('✅ WASM dosyası bulundu');
  console.log(`   Boyut: ${(wasmSize / 1024).toFixed(2)} KB\n`);

  // Display deployment info
  console.log('📋 Deployment Bilgileri:');
  console.log(`   Admin Adresi: ${ADMIN_ADDRESS}`);
  console.log(`   Ağ: Stellar Testnet`);
  console.log(`   RPC: https://soroban-testnet.stellar.org\n`);

  // Step 1: Check prerequisites
  console.log('📋 Kontrol Listesi:');
  const hasFreighter = await question('   ✓ Freighter cüzdan kurulu mu? (y/n): ');
  if (hasFreighter.toLowerCase() !== 'y') {
    console.log('\n⚠️  Freighter kurmak için: https://www.freighter.app/');
    console.log('   (İşlemi devam ettirmek için Freighter gereklidir)\n');
    process.exit(1);
  }

  const hasAccount = await question('   ✓ Admin hesabı Freighter\'da import edildi mi? (y/n): ');
  if (hasAccount.toLowerCase() !== 'y') {
    console.log('\n📝 Freighter\'da yeni hesap ekle:');
    console.log(`   1. Freighter aç → "Ekle" → "Gizli anahtar"ı seç`);
    console.log(`   2. Gizli anahtarı yapıştır (SBXXXXX...)`);
    process.exit(1);
  }

  const onTestnet = await question('   ✓ Ağ Stellar Testnet olarak ayarlandı mı? (y/n): ');
  if (onTestnet.toLowerCase() !== 'y') {
    console.log('\n📝 Ağ değiştirmek için:');
    console.log('   1. Freighter → Ayarlar');
    console.log('   2. Ağ: "Stellar Testnet" seç');
    process.exit(1);
  }

  // Step 2: Display deployment command
  console.log('\n' + '═'.repeat(65));
  console.log('\n🔧 DEPLOYMENT KOMUTU:\n');
  console.log('```bash');
  console.log('$WASM = "contracts/target/wasm32-unknown-unknown/release/prediction_market.wasm"');
  console.log('soroban contract deploy \\');
  console.log('  --wasm $WASM \\');
  console.log('  --network testnet \\');
  console.log('  --source-account ' + ADMIN_ADDRESS);
  console.log('```\n');

  // Step 3: Instructions
  console.log('📝 TARIFİ TAKİP ET:\n');
  console.log('1️⃣  Terminal\'de yukarıdaki komutu kopyala ve çalıştır');
  console.log('2️⃣  Freighter imza penceresinde "Onayla" butonuna tıkla');
  console.log('3️⃣  Terminal\'de Kontrat IDsini kopyala (C ile başlayan adres)\n');

  // Step 4: Contract ID collection
  const hasRun = await question('Komutu calistirdin mi? (y/n): ');
  if (hasRun.toLowerCase() === 'y') {
    const contractId = await question('\n📝 Kontrat ID\'sini yapıştır (CXXXXX...): ');

    if (contractId.startsWith('C') && contractId.length > 50) {
      console.log('\n✅ Kontrat ID geçerli!\n');

      // Save to .env.local
      const envPath = path.join(__dirname, 'frontend', '.env.local');
      const envContent = `NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS=${contractId}\n`;

      fs.appendFileSync(envPath, envContent);
      console.log('✅ .env.local dosyasına kaydedildi!\n');

      // Display next steps
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                    🎉 DEPLOYMENT BAŞARILI 🎉                  ║');
      console.log('╚════════════════════════════════════════════════════════════════╝\n');

      console.log('📋 Sonraki Adımlar:\n');
      console.log('1. Frontend\'i yeniden başlat:');
      console.log('   cd frontend && npm run dev\n');

      console.log('2. Blockchain Explorer\'da kontrol et:');
      console.log(`   https://stellar.expert/explorer/testnet/contract/${contractId}\n`);

      console.log('3. Kontratı initialize et (isteğe bağlı):\n');
      console.log('   soroban contract invoke \\');
      console.log(`     --id ${contractId} \\`);
      console.log('     --network testnet \\');
      console.log(`     --source-account ${ADMIN_ADDRESS} \\`);
      console.log('     -- initialize \\');
      console.log('     --token CBVG2R747Z5F5KXH62RA550F6GRZCH472ESTAVXEWOA6BYHUZCZKJF6H \\');
      console.log(`     --admin ${ADMIN_ADDRESS}\n`);

      console.log('📚 Kaynaklar:');
      console.log('   • Soroban Docs: https://soroban.stellar.org/');
      console.log('   • Stellar Testnet: https://stellar.org/ecosystem/testnet-js-sdk');
      console.log('   • Freighter: https://www.freighter.app/\n');
    } else {
      console.log('\n❌ Geçersiz Kontrat ID!\n');
    }
  }

  rl.close();
}

main().catch(console.error);
