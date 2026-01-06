'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SoloSuccessLogo } from '@/components/cyber/SoloSuccessLogo'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed w-full z-50 top-0 bg-dark-bg/80 backdrop-blur-md border-b border-neon-cyan/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <SoloSuccessLogo size={48} animated={true} />
          <div className="flex flex-col">
            <span className="font-orbitron font-bold text-xl tracking-widest text-white group-hover:text-neon-cyan transition-colors duration-300">
              SOLO<span className="text-neon-cyan group-hover:text-white transition-colors duration-300">SUCCESS</span>.AI
            </span>
            <span className="text-[10px] text-neon-purple tracking-[0.3em] uppercase font-mono group-hover:text-neon-magenta transition-colors duration-300">
              Status: Online
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink label="Features" path="/features" isActive={isActive('/features')} />
          <NavLink label="Pricing" path="/pricing" isActive={isActive('/pricing')} />
          <NavLink label="About" path="/about" isActive={isActive('/about')} />
          <NavLink label="Contact" path="/contact" isActive={isActive('/contact')} />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block">
            <span className="text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors text-gray-400 font-mono">
              LOGIN
            </span>
          </Link>
          <Link href="/signup">
            <Button variant="cyan" size="sm" className="shadow-[0_0_15px_rgba(11,228,236,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ label, path, isActive }: { label: string, path: string, isActive: boolean }) {
  return (
    <Link
      href={path}
      className={`text-sm font-bold uppercase tracking-widest transition-colors font-mono hover:scale-105 duration-200 ${
        isActive ? 'text-neon-cyan drop-shadow-[0_0_5px_rgba(11,228,236,0.8)]' : 'text-gray-400 hover:text-neon-cyan'
      }`}
    >
      {label}
    </Link>
  )
}
