import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setIsLoading(false);
      return;
    }

    // Set up message listener for the popup OAuth
    const handleOAuthMessage = (event) => {
      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        const { provider, user } = event.data;
        setIsLoading(true);
        setTimeout(() => {
          onLoginSuccess({
            ...user,
            provider,
            isSocial: true
          });
          setSuccess(`Logged in successfully via ${provider.toUpperCase()}!`);
          setIsLoading(false);
          setTimeout(() => {
            onClose();
          }, 1000);
        }, 800);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleEmailAuth = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!email || !password || (tab === 'register' && !name)) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (tab === 'register') {
        // Register mock
        const existingUsers = JSON.parse(localStorage.getItem('booth_users') || '[]');
        if (existingUsers.some(u => u.email === email)) {
          setError('Email is already registered!');
          setIsLoading(false);
          return;
        }

        const newUser = { name, email, password, avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}` };
        existingUsers.push(newUser);
        localStorage.setItem('booth_users', JSON.stringify(existingUsers));
        setSuccess('Account created successfully! Switching to login...');
        setIsLoading(false);
        setTimeout(() => {
          setTab('login');
          setSuccess('');
        }, 1500);
      } else {
        // Login mock
        const existingUsers = JSON.parse(localStorage.getItem('booth_users') || '[]');
        const matchedUser = existingUsers.find(u => u.email === email && u.password === password);

        // Fallback for default testing
        if (email === 'admin@example.com' && password === 'admin123') {
          const defaultUser = { name: 'Alghi Azhari', email, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alghi' };
          onLoginSuccess(defaultUser);
          setSuccess('Login successful!');
          setIsLoading(false);
          setTimeout(() => onClose(), 1000);
          return;
        }

        if (!matchedUser) {
          setError('Invalid email or password.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess(matchedUser);
        setSuccess('Login successful!');
        setIsLoading(false);
        setTimeout(() => onClose(), 1000);
      }
    }, 1000);
  };

  const openSocialLogin = (provider) => {
    setError('');
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      '', 
      `oauth_${provider}`, 
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );
    
    if (!popup) {
      setError("Popup blocker is active. Please enable popups to login with socials.");
      return;
    }
    
    const providerDetails = {
      google: {
        name: 'Google',
        color: '#EA4335',
        user: { name: 'Alghi Azhari', email: 'alghiajah@gmail.com', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alghi' }
      },
      facebook: {
        name: 'Facebook',
        color: '#1877F2',
        user: { name: 'Alghi Azhari (FB)', email: 'alghi.fb@example.com', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlghiFB' }
      },
      discord: {
        name: 'Discord',
        color: '#5865F2',
        user: { name: 'alghiajah#1337', email: 'alghi.discord@example.com', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=AlghiDiscord' }
      },
      twitter: {
        name: 'Twitter / X',
        color: '#000000',
        user: { name: 'alghiajah_x', email: 'alghi.x@example.com', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AlghiX' }
      }
    }[provider];
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sign in with ${providerDetails.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 0;
            background: #FCF8F7;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(216, 156, 163, 0.15);
            width: 100%;
            max-width: 380px;
            text-align: center;
            box-sizing: border-box;
            border: 1px solid rgba(216, 156, 163, 0.3);
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #F5E6E8;
            border-top: 4px solid ${providerDetails.color};
            border-radius: 50%;
            margin: 30px auto;
            animation: spin 1s linear infinite;
          }
          .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 20px auto;
            border: 3px solid ${providerDetails.color};
            background-color: #FCF8F7;
            display: none;
            padding: 4px;
          }
          h2 {
            color: #3A2A2D;
            font-size: 20px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          p {
            color: #7D6F72;
            font-size: 13px;
            margin-bottom: 24px;
            line-height: 1.5;
          }
          button {
            background: ${providerDetails.color === '#000000' ? '#1A1A24' : providerDetails.color};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: none;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container" id="loginCard">
          <div class="spinner" id="spinner"></div>
          <img class="avatar" id="avatar" src="${providerDetails.user.avatar}" />
          <h2 id="title">Menghubungkan ke ${providerDetails.name}</h2>
          <p id="desc">Harap tunggu sementara kami membuat sambungan aman ke akun Anda.</p>
          <button id="btn" onclick="authorize()">Lanjutkan sebagai ${providerDetails.user.name}</button>
        </div>

        <script>
          setTimeout(() => {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('avatar').style.display = 'block';
            document.getElementById('btn').style.display = 'block';
            document.getElementById('title').textContent = 'Konfirmasi Otorisasi';
            document.getElementById('desc').textContent = 'Lumière Booth meminta akses untuk membaca nama, email, dan foto profil Anda.';
          }, 1500);

          function authorize() {
            const user = ${JSON.stringify(providerDetails.user)};
            window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider: '${provider}', user }, '*');
            window.close();
          }
        </script>
      </body>
      </html>
    `;
    
    popup.document.write(htmlContent);
    popup.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-chic-border/50 shadow-2xl p-6 md:p-8 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-chic-blush-soft text-chic-gray hover:text-chic-rose transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-chic-dark flex items-baseline justify-center gap-1">
            <span className="font-bold tracking-wider">LUMIÈRE</span>
            <span className="font-serif italic font-light text-chic-rose">Booth</span>
          </h2>
          <p className="text-[10px] text-chic-gray font-mono tracking-widest uppercase mt-1">Studio Authentication</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-chic-blush-soft p-1 rounded-xl mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-chic-rose shadow-sm' : 'text-chic-gray hover:text-chic-dark'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-chic-rose shadow-sm' : 'text-chic-gray hover:text-chic-dark'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs mb-4">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Auth */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {tab === 'register' && (
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-chic-gray" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-chic-input border border-chic-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-chic-dark placeholder-chic-gray/70 focus:outline-none focus:ring-1 focus:ring-chic-rose/30 focus:border-chic-rose transition-all"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-chic-gray" />
            <input
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-chic-input border border-chic-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-chic-dark placeholder-chic-gray/70 focus:outline-none focus:ring-1 focus:ring-chic-rose/30 focus:border-chic-rose transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-chic-gray" />
            <input
              type="password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-chic-input border border-chic-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-chic-dark placeholder-chic-gray/70 focus:outline-none focus:ring-1 focus:ring-chic-rose/30 focus:border-chic-rose transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-chic-rose to-chic-gold text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-99 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {isLoading ? 'Memproses...' : tab === 'login' ? 'Masuk dengan Email' : 'Buat Akun'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-chic-border/30"></div>
          <span className="px-3 text-[9px] font-mono text-chic-gray/60 uppercase">atau Masuk lewat</span>
          <div className="flex-1 border-t border-chic-border/30"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button
            onClick={() => openSocialLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-chic-border/40 bg-white text-xs font-semibold text-chic-dark hover:bg-chic-blush-soft/30 active:scale-95 transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.76 5.76 0 0 1 8.16 12.8a5.76 5.76 0 0 1 5.83-5.8c1.47 0 2.802.553 3.82 1.455l3.22-3.22C18.91 3.25 16.326 2 13.99 2A9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.523 0 10.01-4.487 10.01-10 0-.685-.06-1.343-.17-1.983l-11.59.268z"/>
            </svg>
            Google
          </button>

          {/* Facebook */}
          <button
            onClick={() => openSocialLogin('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-chic-border/40 bg-[#1877F2]/5 text-xs font-semibold text-chic-dark hover:bg-[#1877F2]/10 active:scale-95 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>

          {/* Discord */}
          <button
            onClick={() => openSocialLogin('discord')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-chic-border/40 bg-[#5865F2]/5 text-xs font-semibold text-chic-dark hover:bg-[#5865F2]/10 active:scale-95 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A51.27,51.27,0,0,0,31,78,75.46,75.46,0,0,0,96.16,78a51.27,51.27,0,0,0,2.83,2.5,68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.58-18.83C129.56,48.12,123.41,25.32,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            Discord
          </button>

          {/* Twitter / X */}
          <button
            onClick={() => openSocialLogin('twitter')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-chic-border/40 bg-black/5 text-xs font-semibold text-chic-dark hover:bg-black/10 active:scale-95 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Twitter / X
          </button>
        </div>

      </div>
    </div>
  );
}
