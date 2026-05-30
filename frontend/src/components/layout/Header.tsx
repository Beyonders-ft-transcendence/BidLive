"use client";

import Image from 'next/image';
import Link from 'next/dist/client/link';
import icon from '@/assets/images/icon.png'
import law from '@/assets/images/law.png';
import search from '@/assets/images/search.png';
import Signin from "@/components/layout/Signin";
import CategoriesDropdown from "@/components/common/CategoriesDropdown";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isSigninOpen, setIsSigninOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const openSignin = () => setIsSigninOpen(true);
    const closeSignin = () => setIsSigninOpen(false);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200 py-4 fixed top-0 left-0 w-full z-50">
                <nav className='max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-0'>



                    {/* Left: Logo + Desktop Nav */}
                    <div className='flex items-center space-x-8'>
                        <Image
                            src={icon}
                            width={130}
                            height={40}
                            alt="BidLive Logo"
                            className="inline-block"
                        />

                        <ul className='hidden lg:flex items-center space-x-4'>
                            <li>
                                <Link href="/">
                                    Leilões
                                </Link>
                            </li>
                            <li>
                                <CategoriesDropdown />
                            </li>
                            <li>
                                <Link href="/">
                                    Vendedor
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Center: Search – hidden on mobile */}
                    <div className='hidden lg:flex bg-gray-50 border-gray-200 border p-2 items-center rounded-md w-96'>
                        <input type="text"
                            placeholder="Buscar leilões, categorias, vendedores..."
                            className='flex-1 bg-transparent outline-none'
                        />
                        <button className='bg-transparent cursor-pointer'>
                            <Image
                                src={search}
                                width={20}
                                height={20}
                                alt="Search Icon"
                            />
                        </button>
                    </div>

                    {/* Right: Auth buttons – hidden on mobile */}
                    <ul className='hidden lg:flex items-center space-x-4'>
                        <li>
                            <button
                                onClick={openSignin}
                                className='cursor-pointer hover:text-blue-500 transition-colors'
                            >
                                Entrar
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={openSignin}
                                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors'
                            >
                                Registrar
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={openSignin}
                                className='flex items-center cursor-pointer hover:text-blue-500 transition-colors'
                            >
                                Favoritos
                                <Image
                                    src={law}
                                    width={25}
                                    height={20}
                                    alt="BidLive Logo"
                                    className="inline-block ml-1"
                                />
                            </button>
                        </li>
                    </ul>

                    {/* Hamburger button – mobile only */}
                    <button
                        className='lg:hidden cursor-pointer p-2 -mr-2 text-gray-700 hover:text-blue-500 transition-colors'
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label="Abrir menu"
                    >
                        <Menu size={24} />
                    </button>

                </nav>
            </header>

            {/* ===================== Mobile Sidebar Menu ===================== */}
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className='flex items-center justify-between p-4 border-b border-gray-200'>
                    <Image
                        src={icon}
                        width={110}
                        height={34}
                        alt="BidLive Logo"
                    />
                    <button
                        className='p-2 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors'
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Fechar menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Sidebar Search */}
                <div className='p-4'>
                    <div className='bg-gray-50 border border-gray-200 p-2 flex items-center rounded-md'>
                        <input type="text"
                            placeholder="Buscar..."
                            className='flex-1 bg-transparent outline-none text-sm'
                        />
                        <button className='bg-transparent cursor-pointer'>
                            <Image
                                src={search}
                                width={18}
                                height={18}
                                alt="Search Icon"
                            />
                        </button>
                    </div>
                </div>

                {/* Sidebar Nav Links */}
                <nav className='flex flex-col px-4 space-y-1'>
                    <Link
                        href="/"
                        className='px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors font-medium'
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Leilões
                    </Link>
                    <div className='px-3 py-1'>
                        <CategoriesDropdown />
                    </div>
                    <Link
                        href="/"
                        className='px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors font-medium'
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Vendedor
                    </Link>
                </nav>

                {/* Sidebar Divider */}
                <div className='mx-4 my-4 border-t border-gray-200' />

                {/* Sidebar Auth */}
                <div className='flex flex-col px-4 space-y-2'>
                    <button
                        onClick={() => { openSignin(); setIsMobileMenuOpen(false); }}
                        className='px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors font-medium text-left cursor-pointer'
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => { openSignin(); setIsMobileMenuOpen(false); }}
                        className='bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-[#1d4ed8] transition-colors font-medium text-center cursor-pointer'
                    >
                        Registrar
                    </button>
                    <button
                        onClick={() => { openSignin(); setIsMobileMenuOpen(false); }}
                        className='flex items-center px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-500 transition-colors font-medium cursor-pointer'
                    >
                        Favoritos
                        <Image
                            src={law}
                            width={22}
                            height={18}
                            alt="Favoritos"
                            className="inline-block ml-2"
                        />
                    </button>
                </div>
            </aside>

            {isSigninOpen && <Signin onClose={closeSignin} />}
        </>
    );
}