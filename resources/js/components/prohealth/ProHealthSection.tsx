import React from 'react';
import { Sparkles } from 'lucide-react';

interface ProHealthSectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'gradient' | 'accent';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

interface ProHealthSectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export default function ProHealthSection({
  children,
  className = '',
  background = 'white',
  padding = 'lg',
  id,
}: ProHealthSectionProps) {
  const backgroundClasses = {
    white: 'cs_white_bg',
    gray: 'cs_gray_bg_1',
    gradient: 'bg-gradient-to-br from-[#274760] to-[#307BC4]',
    accent: 'bg-[#307BC4]/5',
  };
  
  const paddingClasses = {
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20 sm:py-24',
    xl: 'py-24 sm:py-32',
  };
  
  const classes = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;
  
  return (
    <section id={id} className={classes}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function ProHealthSectionHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
  className = '',
}: ProHealthSectionHeaderProps) {
  return (
    <div className={`cs_section_heading ${center ? 'text-center' : ''} ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 cs_accent_color bg-[#307BC4]/10 ring-1 ring-[#307BC4]/20 px-4 py-2 cs_radius_25 text-sm cs_medium cs_primary_font">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      
      <h2 className={`cs_section_title mt-6 cs_fs_48 cs_primary_font cs_bold tracking-tight cs_heading_color ${center ? '' : ''}`}>
        {title}
      </h2>
      
      {subtitle && (
        <p className={`mt-4 cs_fs_18 cs_body_color cs_secondary_font leading-relaxed ${center ? 'mx-auto max-w-3xl' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Specialized section layouts
export function ProHealthHeroSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden cs_shape_wrap ${className}`}>
      {/* ProHealth gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#274760] via-[#307BC4] to-[#274760]" />
      
      {/* ProHealth decorative shapes */}
      <div className="cs_shape_1 cs_position_1" aria-hidden="true" />
      <div className="cs_shape_1 cs_position_2" aria-hidden="true" />
      
      {/* Subtle medical pattern overlay */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" opacity="0.3" />
              <path d="M 20 10 L 20 30 M 10 20 L 30 20" stroke="white" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>
      </div>

      {/* ProHealth decorative corner elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white/5 to-[#86BBF1]/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-[#86BBF1]/5 to-white/5 blur-2xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {children}
      </div>
    </section>
  );
}

export function ProHealthFeatureGrid({
  children,
  columns = 3,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${columnClasses[columns]} gap-6 lg:gap-8 ${className}`}>
      {children}
    </div>
  );
}

export function ProHealthStatsGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };
  
  return (
    <div className={`grid ${columnClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function ProHealthTwoColumnLayout({
  leftContent,
  rightContent,
  reverse = false,
  className = '',
}: {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${className}`}>
      <div className={reverse ? 'lg:order-2' : ''}>
        {leftContent}
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        {rightContent}
      </div>
    </div>
  );
}
