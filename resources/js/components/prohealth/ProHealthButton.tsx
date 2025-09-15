import React from 'react';
import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

interface ProHealthButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function ProHealthButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  icon: Icon,
  iconPosition = 'right',
  className = '',
  type = 'button',
}: ProHealthButtonProps) {
  const baseClasses = 'cs_btn cs_primary_font inline-flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#307BC4]/50';
  
  const variantClasses = {
    primary: 'cs_style_1 text-white',
    secondary: 'bg-[#274760] text-white hover:bg-[#274760]/90 cs_radius_25',
    outline: 'border-2 border-[#307BC4] text-[#307BC4] hover:bg-[#307BC4] hover:text-white cs_radius_25',
    text: 'text-[#307BC4] hover:text-[#274760] hover:bg-[#307BC4]/5 cs_radius_15',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
      <span className="relative z-2">{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
    </>
  );
  
  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}
