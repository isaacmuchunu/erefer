import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProHealthCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'feature' | 'stat' | 'testimonial';
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconBg?: string;
  title?: string;
  subtitle?: string;
}

export default function ProHealthCard({
  children,
  variant = 'default',
  className = '',
  hover = true,
  padding = 'md',
  icon: Icon,
  iconBg = 'bg-[#307BC4]/10',
  title,
  subtitle,
}: ProHealthCardProps) {
  const baseClasses = 'cs_white_bg cs_radius_25 cs_shadow_1 transition-all duration-300';
  
  const variantClasses = {
    default: '',
    feature: 'group',
    stat: 'text-center',
    testimonial: 'relative',
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:cs_shadow_2 hover:-translate-y-1' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {Icon && (
        <div className={`w-12 h-12 cs_radius_15 ${iconBg} flex items-center justify-center mb-4 ${variant === 'feature' ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}>
          <Icon className="h-6 w-6 cs_accent_color" />
        </div>
      )}
      
      {title && (
        <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-2">
          {title}
        </h3>
      )}
      
      {subtitle && (
        <p className="text-sm cs_body_color cs_secondary_font mb-4">
          {subtitle}
        </p>
      )}
      
      {children}
    </div>
  );
}

// Specialized card components
export function ProHealthFeatureCard({
  icon: Icon,
  iconBg = 'bg-[#307BC4]/10',
  title,
  description,
  bullets = [],
  className = '',
}: {
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  description: string;
  bullets?: string[];
  className?: string;
}) {
  return (
    <ProHealthCard
      variant="feature"
      icon={Icon}
      iconBg={iconBg}
      title={title}
      className={className}
    >
      <p className="cs_body_color cs_secondary_font mb-4 leading-relaxed">
        {description}
      </p>
      
      {bullets.length > 0 && (
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-center text-sm cs_body_color cs_secondary_font">
              <div className="w-1.5 h-1.5 cs_radius_10 bg-[#307BC4] mr-3 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </ProHealthCard>
  );
}

export function ProHealthStatCard({
  value,
  label,
  trend,
  icon: Icon,
  className = '',
}: {
  value: string;
  label: string;
  trend?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <ProHealthCard variant="stat" className={className}>
      {Icon && (
        <div className="w-10 h-10 cs_radius_15 bg-[#307BC4]/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-5 w-5 cs_accent_color" />
        </div>
      )}
      
      <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font tabular-nums">
        {value}
      </div>
      
      <div className="text-sm cs_body_color cs_secondary_font mt-2">
        {label}
      </div>
      
      {trend && (
        <div className="text-xs cs_accent_color/80 mt-1">
          {trend}
        </div>
      )}
    </ProHealthCard>
  );
}

export function ProHealthTestimonialCard({
  quote,
  author,
  role,
  company,
  className = '',
}: {
  quote: string;
  author: string;
  role: string;
  company?: string;
  className?: string;
}) {
  return (
    <ProHealthCard variant="testimonial" className={className}>
      <div className="mb-4">
        <p className="cs_body_color cs_secondary_font leading-relaxed italic">
          "{quote}"
        </p>
      </div>
      
      <div className="border-t border-[#307BC4]/10 pt-4">
        <div className="cs_fs_16 cs_semibold cs_heading_color cs_primary_font">
          {author}
        </div>
        <div className="text-sm cs_body_color cs_secondary_font">
          {role}
          {company && ` • ${company}`}
        </div>
      </div>
    </ProHealthCard>
  );
}
