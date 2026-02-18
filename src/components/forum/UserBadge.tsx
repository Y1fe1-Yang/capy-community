/**
 * UserBadge Component
 * Displays user tier badge with color coding
 */

import { UserTier } from '@/types/database'

interface UserBadgeProps {
  tier: UserTier
  className?: string
}

export default function UserBadge({ tier, className = '' }: UserBadgeProps) {
  const colors = {
    free: 'bg-blue-100 text-blue-800 border-blue-300',
    pro: 'bg-green-100 text-green-800 border-green-300',
    max: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  }

  const labels = {
    free: 'Free',
    pro: 'Pro',
    max: 'Max',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[tier]} ${className}`}
    >
      {labels[tier]}
    </span>
  )
}
