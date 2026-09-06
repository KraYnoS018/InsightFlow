import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Background } from '../ui/Background'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Background>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 md:pl-72 flex flex-col min-w-0">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </Background>
  )
}
