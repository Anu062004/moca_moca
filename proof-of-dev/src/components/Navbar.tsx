'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Shield, 
  Wallet, 
  User,
  Settings,
  LogOut
} from 'lucide-react'

interface NavbarProps {
  onConnectWallet: () => void
  onVerifyProfile: () => void
  onViewProfile: () => void
  isConnected?: boolean
  userAddress?: string
}

export function Navbar({ 
  onConnectWallet, 
  onVerifyProfile, 
  onViewProfile,
  isConnected = false,
  userAddress
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navItems = [
    { label: 'Home', icon: <Home className="w-4 h-4" />, onClick: () => {} },
    { label: 'Verify', icon: <Shield className="w-4 h-4" />, onClick: onVerifyProfile },
    { label: 'Profile', icon: <User className="w-4 h-4" />, onClick: onViewProfile },
  ]
  
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50
                 bg-black/20 backdrop-blur-md border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MOCA
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                className="flex items-center space-x-2 text-white/80 hover:text-white
                           transition-colors duration-200 px-3 py-2 rounded-lg
                           hover:bg-white/10"
                onClick={item.onClick}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            <motion.button
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center space-x-2
                ${isConnected 
                  ? 'bg-green-600/20 text-green-400 border border-green-400/30' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                }
                shadow-lg hover:shadow-xl
              `}
              onClick={onConnectWallet}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnected 
                  ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`
                  : 'Connect Wallet'
                }
              </span>
            </motion.button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              className="text-white/80 hover:text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <motion.div
        className="md:hidden bg-black/40 backdrop-blur-md border-t border-white/10"
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-4 space-y-4">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              className="flex items-center space-x-3 text-white/80 hover:text-white
                         w-full text-left px-3 py-2 rounded-lg hover:bg-white/10
                         transition-colors duration-200"
              onClick={() => {
                item.onClick()
                setIsMenuOpen(false)
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -20 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.button>
          ))}
          
          {/* Mobile Connect Button */}
          <motion.button
            className={`
              w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center space-x-2 mt-4
              ${isConnected 
                ? 'bg-green-600/20 text-green-400 border border-green-400/30' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              }
            `}
            onClick={() => {
              onConnectWallet()
              setIsMenuOpen(false)
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : 20 }}
            transition={{ delay: 0.3 }}
          >
            <Wallet className="w-4 h-4" />
            <span>
              {isConnected 
                ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`
                : 'Connect Wallet'
              }
            </span>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
    </motion.nav>
  )
}

