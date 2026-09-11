import React from 'react';
import { Trophy, Flame, Zap, Shield, Crown, Target, Star, Award, Sparkles, Heart } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

export const AVATAR_LIST: AvatarOption[] = [
  { id: 'trophy', name: 'Champion', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  { id: 'flame', name: 'Hot Streak', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' },
  { id: 'zap', name: 'Speed Blitz', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/40' },
  { id: 'shield', name: 'Defender', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
  { id: 'crown', name: 'Royalty', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
  { id: 'target', name: 'Sharp Shooter', icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  { id: 'star', name: 'All-Star', icon: Star, color: 'text-amber-300', bg: 'bg-amber-400/20', border: 'border-amber-400/40' },
  { id: 'award', name: 'MVP', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
  { id: 'sparkles', name: 'Prodigy', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40' },
  { id: 'heart', name: 'Fan Favorite', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/40' }
];

export const AvatarBadge: React.FC<{
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ avatar, size = 'md', className = '' }) => {
  const match = AVATAR_LIST.find(a => a.id === avatar);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-xl',
    xl: 'w-20 h-20 text-2xl rounded-2xl'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10'
  }[size];

  if (match) {
    const Icon = match.icon;
    return (
      <div className={`flex items-center justify-center border ${match.bg} ${match.border} ${match.color} ${sizeClasses} ${className}`}>
        <Icon className={iconSizes} />
      </div>
    );
  }

  // Fallback for default or question mark avatars
  return (
    <div className={`flex items-center justify-center border bg-sky-500/20 border-sky-500/40 text-sky-400 ${sizeClasses} ${className}`}>
      <Trophy className={iconSizes} />
    </div>
  );
};
