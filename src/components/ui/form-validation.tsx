'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: unknown, rules: ValidationRule): string | null {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rules.message || 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // Min length validation
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return rules.message || `Must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return rules.message || `Must be no more than ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(data: Record<string, unknown>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const error = validateField(value, fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  label?: string;
  required?: boolean;
}

export function ValidatedInput({ 
  error, 
  label, 
  required, 
  className, 
  id,
  ...props 
}: ValidatedInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-medium text-card-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  label?: string;
  required?: boolean;
}

export function ValidatedTextarea({ 
  error, 
  label, 
  required, 
  className, 
  id,
  ...props 
}: ValidatedTextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="text-sm font-medium text-card-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Common validation rules
export const commonValidationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required'
  }),
  
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address'
  }),
  
  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'Please enter a valid URL'
  }),
  
  slug: (message?: string): ValidationRule => ({
    pattern: /^[a-z0-9-]+$/,
    message: message || 'Slug can only contain lowercase letters, numbers, and hyphens'
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`
  }),
  
  positiveNumber: (message?: string): ValidationRule => ({
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return message || 'Must be a positive number';
      }
      return null;
    }
  }),
  
  fileSize: (maxSizeMB: number, message?: string): ValidationRule => ({
    custom: (value: unknown) => {
      if (value && value instanceof File && value.size > maxSizeMB * 1024 * 1024) {
        return message || `File size must be less than ${maxSizeMB}MB`;
      }
      return null;
    }
  }),
  
  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    custom: (value: unknown) => {
      if (value && value instanceof File && !allowedTypes.includes(value.type)) {
        return message || `File type must be one of: ${allowedTypes.join(', ')}`;
      }
      return null;
    }
  })
};
