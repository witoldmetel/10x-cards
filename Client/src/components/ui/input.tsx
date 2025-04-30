import { cn } from '@/lib/tailwind';
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={inputId} className='block text-sm font-medium text-neutral-700 mb-1'>
            {label}
          </label>
        )}

        <div className='relative'>
          {leftElement && (
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500'>
              {leftElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              error
                ? 'border-error-500 focus:ring-1 focus:ring-error-500 focus:border-error-500'
                : 'border-neutral-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500'>
              {rightElement}
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p className={cn('mt-1 text-sm', error ? 'text-error-500' : 'text-neutral-500')}>{error || helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
