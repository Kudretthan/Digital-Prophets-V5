'use client';

import { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/types';

interface AnalystProfileProps {
  profile: UserProfile;
  onAvatarChange?: (newAvatar: string) => void;
  onUsernameChange?: (newUsername: string) => void;
}

export function AnalystProfile({ profile, onAvatarChange, onUsernameChange }: AnalystProfileProps) {
  const accuracyTrend = profile.successRate >= 60 ? 'up' : 'down';
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = ['🎯', '🎱', '🧠', '⚡', '🐉', '👾'];

  // Username değiştiğinde temp'i güncelle
  useEffect(() => {
    setTempUsername(profile.username);
  }, [profile.username]);

  // Username input'una focus
  useEffect(() => {
    if (isEditingUsername && usernameInputRef.current) {
      usernameInputRef.current.focus();
      usernameInputRef.current.select();
    }
  }, [isEditingUsername]);

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAvatarMenu(false);
      }
    }
    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAvatarMenu]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('Lütfen 2MB altında bir profil fotoğrafı seçin.');
      e.target.value = '';
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      const scale = Math.max(size / img.width, size / img.height);
      const x = (size / 2) - (img.width * scale) / 2;
      const y = (size / 2) - (img.height * scale) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);

      if (onAvatarChange) {
        onAvatarChange(dataUrl);
        setShowAvatarMenu(false);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Görsel yüklenemedi. Lütfen farklı bir dosya deneyin.');
    };
    img.src = url;
    e.target.value = '';
  };

  const handleUsernameSubmit = () => {
    const trimmed = tempUsername.trim();
    if (trimmed && trimmed !== profile.username && onUsernameChange) {
      onUsernameChange(trimmed);
    }
    setIsEditingUsername(false);
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUsernameSubmit();
    } else if (e.key === 'Escape') {
      setTempUsername(profile.username);
      setIsEditingUsername(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative" ref={menuRef}>
            {/* Kare profil fotoğrafı */}
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg overflow-hidden shadow-lg flex items-center justify-center text-2xl">
              {profile.avatar && profile.avatar.startsWith('data:image') ? (
                <img
                  src={profile.avatar}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">{profile.avatar || '👤'}</span>
              )}
            </div>

            {/* Sağ üstte küçük + butonu */}
            {onAvatarChange && (
              <button
                type="button"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/90 text-pink-600 border border-pink-400 flex items-center justify-center text-base font-bold cursor-pointer shadow-md hover:scale-110 transition-transform"
              >
                +
              </button>
            )}

            {/* Dropdown menü */}
            {showAvatarMenu && onAvatarChange && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl min-w-[200px]">
                <p className="text-[10px] text-white/50 mb-2 font-semibold">SEMBOL SEÇ</p>
                <div className="grid grid-cols-6 gap-1 mb-3">
                  {presetAvatars.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onAvatarChange(emoji);
                        setShowAvatarMenu(false);
                      }}
                      className={`h-8 w-8 rounded-md flex items-center justify-center text-lg border transition-all bg-white/5 hover:bg-white/20 hover:scale-110 ${
                        profile.avatar === emoji ? 'border-pink-400 shadow-lg shadow-pink-500/30' : 'border-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/50 rounded-lg text-xs text-white/80 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    📷 Fotoğraf Yükle
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            {/* Kullanıcı adı - düzenlenebilir */}
            <div className="flex items-center gap-2">
              {isEditingUsername ? (
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onBlur={handleUsernameSubmit}
                  onKeyDown={handleUsernameKeyDown}
                  maxLength={20}
                  className="text-2xl font-bold text-white bg-white/10 border border-cyan-400 rounded-lg px-2 py-1 outline-none w-40"
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                  {onUsernameChange && (
                    <button
                      type="button"
                      onClick={() => setIsEditingUsername(true)}
                      className="text-white/40 hover:text-cyan-400 transition-colors"
                      title="Kullanıcı adını düzenle"
                    >
                      ✏️
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-white/60">
              {profile.walletAddress.slice(0, 10)}...{profile.walletAddress.slice(-6)}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {new Date(profile.joinedAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${accuracyTrend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
            {profile.successRate}%
          </div>
          <p className="text-xs text-white/60">BAŞARI ORANI</p>
        </div>
      </div>

      <p className="text-sm text-white/80 mb-4 border-b border-white/10 pb-4">{profile.bio}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-cyan-300">{profile.totalPredictions}</div>
          <p className="text-xs text-white/60">TOPLAM TAHMİN</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-300">{profile.correctPredictions}</div>
          <p className="text-xs text-white/60">DOĞRU TAHMIN</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-300">{profile.xlmBalance.toLocaleString()}</div>
          <p className="text-xs text-white/60">XLM BAKİYE</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-2xl font-bold text-amber-300">+{profile.xlmEarned.toLocaleString()}</div>
          <p className="text-xs text-white/60">KAZANILAN</p>
        </div>
      </div>

      {profile.badges.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-white/60 font-bold mb-2">ROZETLER</p>
          <div className="flex gap-2 flex-wrap">
            {profile.badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 rounded-lg text-xs text-purple-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
