'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Wallet, 
  Shield, 
  User, 
  Zap, 
  Globe, 
  Star,
  CheckCircle,
  ExternalLink,
  Award
} from 'lucide-react'

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  position: { x: number; y: number }
  delay?: number
  variant?: 'primary' | 'secondary' | 'accent'
}

function ActionButton({ icon, label, onClick, position, delay = 0, variant = 'primary' }: ActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const variants = {
    primary: 'from-purple-600 to-pink-600',
    secondary: 'from-blue-600 to-cyan-600',
    accent: 'from-green-600 to-emerald-600'
  }
  
  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.2,
        rotate: 5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        className={`
          relative w-16 h-16 rounded-full
          bg-gradient-to-br ${variants[variant]}
          shadow-lg hover:shadow-2xl
          flex items-center justify-center
          text-white
          border-2 border-white/20
          backdrop-blur-sm
          transition-all duration-300
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          boxShadow: isHovered 
            ? '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)'
            : '0 0 20px rgba(139, 92, 246, 0.3)'
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"
          animate={{
            opacity: isHovered ? 1 : 0.5,
            scale: isHovered ? 1.1 : 1
          }}
        />
        
        {/* Icon */}
        <motion.div
          animate={{
            rotate: isHovered ? 10 : 0,
            scale: isHovered ? 1.1 : 1
          }}
        >
          {icon}
        </motion.div>
        
        {/* Tooltip */}
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2
                     bg-black/80 backdrop-blur-sm text-white text-sm
                     px-3 py-1 rounded-lg border border-white/20
                     whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2
                          w-0 h-0 border-l-4 border-r-4 border-t-4
                          border-l-transparent border-r-transparent border-t-black/80" />
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

interface ActionButtonsProps {
  onConnectWallet: () => void
  onVerifyProfile: () => void
  onViewProfile: () => void
  onViewCredentials: () => void
  onMintToken: () => void
  onExploreNetwork: () => void
  onViewStats: () => void
}

export function ActionButtons({
  onConnectWallet,
  onVerifyProfile,
  onViewProfile,
  onViewCredentials,
  onMintToken,
  onExploreNetwork,
  onViewStats
}: ActionButtonsProps) {
  const buttons = [
    {
      icon: <Wallet className="w-6 h-6" />,
      label: 'Connect Wallet',
      onClick: onConnectWallet,
      position: { x: 20, y: 30 },
      delay: 0.2,
      variant: 'primary' as const
    },
    {
      icon: <Shield className="w-6 h-6" />,
      label: 'Verify Profile',
      onClick: onVerifyProfile,
      position: { x: 80, y: 25 },
      delay: 0.4,
      variant: 'secondary' as const
    },
    {
      icon: <User className="w-6 h-6" />,
      label: 'View Profile',
      onClick: onViewProfile,
      position: { x: 15, y: 70 },
      delay: 0.6,
      variant: 'accent' as const
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'View Credentials',
      onClick: onViewCredentials,
      position: { x: 50, y: 20 },
      delay: 0.7,
      variant: 'primary' as const
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: 'Mint Token',
      onClick: onMintToken,
      position: { x: 85, y: 70 },
      delay: 0.8,
      variant: 'primary' as const
    },
    {
      icon: <Globe className="w-6 h-6" />,
      label: 'Explore Network',
      onClick: onExploreNetwork,
      position: { x: 10, y: 50 },
      delay: 1.0,
      variant: 'secondary' as const
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: 'View Stats',
      onClick: onViewStats,
      position: { x: 90, y: 50 },
      delay: 1.2,
      variant: 'accent' as const
    }
  ]
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {buttons.map((button, index) => (
        <ActionButton key={index} {...button} />
      ))}
      
      {/* Floating particles between buttons */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}



