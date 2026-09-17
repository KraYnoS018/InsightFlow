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
        <div className="flex-1 md:pl-64 flex flex-col min-w-0 print:pl-0">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto print:p-0 print:max-w-none">
            <Outlet />
          </main>
        </div>
      </div>
    </Background>
  )
}
