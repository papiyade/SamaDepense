import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
  gradient?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md',
  animate = true,
  gradient = false,
  className,
  ...props
}) => {
  const baseClasses = 'card'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    hover && 'card-hover cursor-pointer',
    gradient && 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900',
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -2 } : undefined}
        className={classes}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

// Composants spécialisés
export const StatCard: React.FC<{
  title: string
  value: string | number
  change?: {
    value: number
    type: 'positive' | 'negative' | 'neutral'
  }
  icon?: React.ReactNode
  color?: string
  loading?: boolean
}> = ({ title, value, change, icon, color = 'primary', loading = false }) => {
  if (loading) {
    return (
      <Card className="stat-card">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-text w-20" />
            <div className="skeleton-title w-16" />
          </div>
          <div className="skeleton w-10 h-10 rounded-xl" />
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {change && (
            <p className={clsx(
              'stat-change',
              change.type === 'positive' && 'stat-change-positive',
              change.type === 'negative' && 'stat-change-negative',
              change.type === 'neutral' && 'stat-change-neutral'
            )}>
              {change.type === 'positive' ? '+' : ''}
              {change.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/20`}>
            <div className={`text-${color}-600 dark:text-${color}-400`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export const ProgressCard: React.FC<{
  title: string
  current: number
  target: number
  color?: string
  icon?: React.ReactNode
}> = ({ title, current, target, color = 'primary', icon }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

  return (
    <Card hover className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-100">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <div className={`text-${color}-600 dark:text-${color}-400`}>
              {icon}
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {current.toLocaleString()} CFA
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            {target.toLocaleString()} CFA
          </span>
        </div>
        
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`progress-fill bg-${color}-500`}
          />
        </div>
        
        <div className="text-right">
          <span className={`text-sm font-medium text-${color}-600 dark:text-${color}-400`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  )
}

export default Card

