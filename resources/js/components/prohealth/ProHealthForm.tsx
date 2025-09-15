import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProHealthFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  variant?: 'default' | 'card' | 'modal';
}

interface ProHealthInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: LucideIcon;
  className?: string;
  id?: string;
  name?: string;
}

interface ProHealthTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  rows?: number;
  className?: string;
  id?: string;
  name?: string;
}

interface ProHealthSelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
}

export default function ProHealthForm({
  children,
  onSubmit,
  className = '',
  variant = 'default',
}: ProHealthFormProps) {
  const variantClasses = {
    default: '',
    card: 'cs_white_bg cs_radius_25 cs_shadow_1 p-8',
    modal: 'cs_white_bg p-6',
  };
  
  const classes = `${variantClasses[variant]} ${className}`;
  
  return (
    <form onSubmit={onSubmit} className={classes}>
      {children}
    </form>
  );
}

export function ProHealthInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  icon: Icon,
  className = '',
  id,
  name,
}: ProHealthInputProps) {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block cs_fs_14 cs_medium cs_heading_color cs_primary_font"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`cs_form_field w-full cs_secondary_font ${error ? 'border-red-500 focus:border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        {Icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Icon className="h-5 w-5 cs_accent_color" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 cs_secondary_font">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProHealthTextarea({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  rows = 4,
  className = '',
  id,
  name,
}: ProHealthTextareaProps) {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block cs_fs_14 cs_medium cs_heading_color cs_primary_font"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`cs_form_field w-full resize-none cs_secondary_font ${error ? 'border-red-500 focus:border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      
      {error && (
        <p className="text-sm text-red-600 cs_secondary_font">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProHealthSelect({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  children,
  className = '',
  id,
  name,
}: ProHealthSelectProps) {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block cs_fs_14 cs_medium cs_heading_color cs_primary_font"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`cs_form_field w-full cs_secondary_font ${error ? 'border-red-500 focus:border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 cs_secondary_font">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProHealthFormGroup({
  children,
  columns = 1,
  className = '',
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };
  
  return (
    <div className={`grid ${columnClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function ProHealthFormActions({
  children,
  align = 'right',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };
  
  return (
    <div className={`flex items-center gap-4 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}
