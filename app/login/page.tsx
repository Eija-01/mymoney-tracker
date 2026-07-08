'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logika login hardcode (Kredensial diatur di sini)
    if (username === 'admin' && password === '12345') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/'); // Kembali ke halaman utama setelah berhasil
    } else {
      setError('Username atau password tidak sesuai.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 font-sans text-gray-800">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Selamat Datang</h1>
          <p className="mt-2 text-sm text-gray-500">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan password"
              required
            />
          </div>

          {/* Menampilkan pesan error jika salah */}
          {error && (
            <p className="text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            Masuk
          </button>
        </form>

      </div>
    </main>
  );
}