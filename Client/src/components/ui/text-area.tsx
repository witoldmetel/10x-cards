import React, { forwardRef } from 'react';
import { cn } from '@/lib/tailwind';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={textareaId} className='block text-sm font-medium text-neutral-700 mb-1'>
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none min-h-[100px] resize-y',
            error
              ? 'border-error-500 focus:ring-1 focus:ring-error-500 focus:border-error-500'
              : 'border-neutral-300 focus:ring-2 focus:ring-primary-300 focus:border-primary-500',
            className,
          )}
          {...props}
        />

        {(helperText || error) && (
          <p className={cn('mt-1 text-sm', error ? 'text-error-500' : 'text-neutral-500')}>{error || helperText}</p>
        )}
      </div>
    );
  },
);
