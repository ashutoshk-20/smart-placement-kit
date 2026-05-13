"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Button } from './ui/button';

import {
    ChevronDown,
    LayoutDashboard,
    StarsIcon,
    FileText,
    Code,
    GraduationCap,
    BrainCircuit,
    ClipboardList,
    PenBox
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './ui/dropdown-menu';

const Header = () => {

    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ CHECK AUTH
    useEffect(() => {

        const checkAuth = async () => {

            try {

                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                });

                const data = await res.json();

                setLoggedIn(data.authenticated);

            } catch (error) {

                setLoggedIn(false);

            } finally {

                setLoading(false);
            }
        };

        checkAuth();

    }, []);

    // ✅ LOGOUT
    const handleLogout = async () => {

        try {

            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            setLoggedIn(false);

            window.location.href = "/";

        } catch (error) {

            console.log(error);
        }
    };

    return (

        <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60'>

            <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>

                {/* LOGO */}
                <Link href={"/"}>
                    <Image
                        src="/l.png"
                        alt="SoftStart Logo"
                        width={200}
                        height={60}
                        className='h-12 py-1 w-auto object-contain'
                        priority
                    />
                </Link>

                {/* RIGHT SECTION */}
                <div className='flex items-center space-x-2 md:space-x-4'>

                    {loading ? null : loggedIn ? (

                        <>

                            {/* DASHBOARD */}
                            <Link href={"/dashboard"}>
                                <Button variant={'outline'} className="gap-2">

                                    <LayoutDashboard className='h-4 w-4' />

                                    <span className='hidden md:block'>
                                        Dashboard
                                    </span>

                                </Button>
                            </Link>

                            {/* PREPARATION HUB */}
                            <DropdownMenu>

                                <DropdownMenuTrigger asChild>

                                    <div className='flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all'>

                                        <StarsIcon className='h-4 w-4' />

                                        <span className='hidden md:block font-medium'>
                                            Preparation Hub
                                        </span>

                                        <ChevronDown className='h-4 w-4' />

                                    </div>

                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    className="w-60"
                                    align="end"
                                >

                                    {/* RESUME */}
                                    <DropdownMenuItem>

                                        <Link
                                            href="/resume"
                                            className='flex items-center gap-3 w-full'
                                        >

                                            <FileText className='h-4 w-4 text-primary' />

                                            <span>
                                                Resume Builder
                                            </span>

                                        </Link>

                                    </DropdownMenuItem>

                                    {/* CODING */}
                                    <DropdownMenuItem>

                                        <Link
                                            href="/coding"
                                            className='flex items-center gap-3 w-full'
                                        >

                                            <Code className='h-4 w-4 text-primary' />

                                            <span>
                                                Coding Practice
                                            </span>

                                        </Link>

                                    </DropdownMenuItem>

                                    {/* INTERVIEW */}
                                    <DropdownMenuItem>

                                        <Link
                                            href="/interview"
                                            className='flex items-center gap-3 w-full'
                                        >

                                            <GraduationCap className='h-4 w-4 text-primary' />

                                            <span>
                                                Interview Prep
                                            </span>

                                        </Link>

                                    </DropdownMenuItem>

                                    {/* PLACEMENT PROCESS */}
                                    <DropdownMenuItem>

                                        <Link
                                            href="/placement-process"
                                            className='flex items-center gap-3 w-full'
                                        >

                                            <ClipboardList className='h-4 w-4 text-primary' />

                                            <span>
                                                Placement Process
                                            </span>

                                        </Link>

                                    </DropdownMenuItem>

                                </DropdownMenuContent>

                            </DropdownMenu>

                            {/* LOGOUT */}
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                            >
                                Logout
                            </Button>

                        </>

                    ) : (

                        <>

                            {/* LOGIN */}
                            <Link href="/login">

                                <Button variant="outline">
                                    Login
                                </Button>

                            </Link>

                            {/* SIGNUP */}
                            <Link href="/register">

                                <Button>
                                    Sign Up
                                </Button>

                            </Link>

                        </>

                    )}

                </div>

            </nav>

        </header>
    );
};

export default Header;