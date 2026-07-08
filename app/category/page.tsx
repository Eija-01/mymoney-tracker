'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

// Mendefinisikan tipe data untuk Kategori
interface Category {
    id: string;
    name: string;
    type: 'pemasukan' | 'pengeluaran';
}

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [type, setType] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');

    // Mengambil data dari Supabase saat halaman dimuat
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*');
            if (data) setCategories(data as Category[]);
        };
        fetchCategories();
    }, []);

    // Fungsi untuk menyimpan kategori baru
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: name.trim(), type: type }])
            .select(); // .select() agar kita dapat ID baru dari Supabase

        if (data) {
            setCategories([...categories, ...data]); // Update tampilan
            setName('');
        }
    };

    // Fungsi untuk menghapus kategori
    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (!error) {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
            <div className="mx-auto max-w-xl">

                {/* Header Navigasi */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Kategori</h1>
                        <p className="text-sm text-gray-500">Kelola label transaksi Anda</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-100"
                    >
                        ← Kembali
                    </Link>
                </header>

                {/* Form Tambah Kategori */}
                <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                    <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Nama Kategori</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                placeholder="Contoh: Gaji, Belanja, Bensin..."
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-checked:border-green-500 has-:checked:bg-green-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="pemasukan"
                                    checked={type === 'pemasukan'}
                                    onChange={() => setType('pemasukan')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${type === 'pemasukan' ? 'text-green-700' : 'text-gray-500'}`}>
                                    Pemasukan
                                </span>
                            </label>

                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 transition has-checked:border-red-500 has-:checked:bg-red-50">
                                <input
                                    type="radio"
                                    name="type"
                                    value="pengeluaran"
                                    checked={type === 'pengeluaran'}
                                    onChange={() => setType('pengeluaran')}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium ${type === 'pengeluaran' ? 'text-red-700' : 'text-gray-500'}`}>
                                    Pengeluaran
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
                        >
                            Simpan Kategori
                        </button>
                    </form>
                </section>

                {/* Daftar Kategori yang Tersimpan */}
                <section>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Daftar Kategori</h3>
                    <div className="flex flex-col gap-3">
                        {categories.length === 0 ? (
                            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                                <p className="text-sm text-gray-400">Belum ada kategori yang dibuat.</p>
                            </div>
                        ) : (
                            categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`h-2 w-2 rounded-full ${category.type === 'pemasukan' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className="font-medium text-gray-800">{category.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-xs font-medium text-gray-400 transition hover:text-red-500"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}