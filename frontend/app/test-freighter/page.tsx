'use client';

import React, { useState, useEffect } from 'react';
import { getAddress, isConnected, requestAccess } from '@stellar/freighter-api';

export default function TestDeploy() {
  const [status, setStatus] = useState('ready');
  const [result, setResult] = useState('');
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await isConnected();
        setIsFreighterAvailable(connected.isConnected);
        if (!connected.isConnected) {
          setResult('⚠️ Freighter eklentisi yüklenmiş, ancak bağlanılamadı.\nFreighter tarayıcı extension\'ini kurmuş musunuz?');
        }
      } catch (error) {
        setIsFreighterAvailable(false);
        setResult('⚠️ Freighter eklentisi bulunamadı!\nhttps://freighter.app adresinden indirin.');
      }
    };
    checkFreighter();
  }, []);

  const testFreighter = async () => {
    try {
      setStatus('testing');
      setResult('🔗 Freighter kontrol ediliyor...');

      // İzin iste
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }

      const publicKey = accessResult.address;
      if (!publicKey) {
        throw new Error('Cüzdan adresi alınamadı');
      }

      setResult(`✅ Freighter bağlandı!\n\nAdres: ${publicKey}`);
      setStatus('success');
    } catch (error) {
      setResult(`❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">🧪 Freighter Test</h1>

        <div className="bg-black/50 p-6 rounded-lg border border-cyan-700">
          <div className="mb-4 p-3 bg-cyan-900/30 rounded border border-cyan-600">
            <span className="text-sm">
              {isFreighterAvailable ? '✅ Freighter tespit edildi' : '❌ Freighter bulunamadı'}
            </span>
          </div>

          <button
            onClick={testFreighter}
            disabled={status === 'testing' || !isFreighterAvailable}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 rounded mb-4"
          >
            {status === 'testing' ? '⏳ Kontrol ediliyor...' : '🔧 Freighter\'ı Test Et'}
          </button>

          <div className="bg-black p-4 rounded border border-cyan-600 whitespace-pre-wrap font-mono text-sm text-cyan-300">
            {result || 'Başla butonuna tıkla...'}
          </div>
        </div>

        <div className="mt-8 bg-yellow-900/30 p-4 rounded border border-yellow-600 text-yellow-300 text-sm">
          <strong>Kontrol Listesi:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>✅ Freighter tarayıcı extension kurulu mu?</li>
            <li>Freighter açılı ve kilit açık mı?</li>
            <li>Cüzdan Stellar Testnet'e ayarlanmış mı?</li>
            <li>Hesapta XLM var mı?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
