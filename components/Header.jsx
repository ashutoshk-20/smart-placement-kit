import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Code, ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, PenBoxIcon, StarsIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
    await checkUser();
    return (
        <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60'>

            <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
                <Link href={"/"}>
                    <Image
                        src="/l.png"
                        alt="SoftStart Logo"
                        width={200}
                        height={60}

                        className='h-12 py-1 w-auto object-contain'
                    />
                </Link>

                <div className='flex items-center space-x-2 md:space-x-4'>
                    <SignedIn>
                        <Link href={"/dashboard"}>
                            <Button variant={'outline'}>
                                <LayoutDashboard className='h-4 w-4' />
                                <span className='hidden md:block'>
                                    Industry insights
                                </span>
                            </Button>
                        </Link>


                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='flex items-center gap-1 cursor-pointer px-3 py-2 rounded-md hover:bg-primary/90 transition bg-primary text-primary-foreground'>
                                    <StarsIcon className='h-4 w-4' />
                                    <span className='hidden md:block'>Growth Tools</span>
                                    <ChevronDown className='h-4 w-4' />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href={"/resume"} className='flex items-center gap-2'>
                                        <FileText className='h-4 w-4' />
                                        <span>Build Resume</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href={"/ai-cover-letter"} className='flex items-center gap-2'>
                                        <PenBox className='h-4 w-4' />
                                        <span>Cover Letter</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href={"/interview"} className='flex items-center gap-2 w-full'>
                                        <GraduationCap className='h-4 w-4' />
                                        <span>Interview Prep</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href={"/coding"} className='flex items-center gap-2 w-full'>
                                        <Code className='h-4 w-4' />
                                        <span>Coding Challenge</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </SignedIn>


                    <SignedOut>
                        <SignInButton >
                            <Button variant={'outline'}>Sign In </Button>
                        </SignInButton>
                        <SignUpButton >
                            <Button variant={'outline'}>Sign Up </Button>
                        </SignUpButton>
                    </SignedOut>

                    <SignedIn>
                        <UserButton 
                            appearance={{
                                elements:{
                                    avatarBox:"w-10 h-10",
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-semibold"
                                }
                            }}
                            afterSignOutUrl='/'
                        />
                    </SignedIn>
                </div>
            </nav>
        </header>
    )
}

export default Header