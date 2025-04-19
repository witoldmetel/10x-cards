import React, { useState, useCallback } from 'react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const MAX_CHARS = 50000;
const MIN_CHARS = 10;

export function TextInput({ onSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (text.length >= MIN_CHARS && text.length <= MAX_CHARS) {
        onSubmit(text);
      }
    },
    [text, onSubmit],
  );

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-3xl mx-auto space-y-4'>
      <div className='relative'>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder='Paste your text here to generate flashcards...'
          className='w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
          maxLength={MAX_CHARS}
          disabled={isLoading}
        />
        <div className='absolute bottom-2 right-2 text-sm text-gray-500'>
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <span className='text-sm text-gray-500'>Minimum {MIN_CHARS} characters required</span>
        <button
          type='submit'
          disabled={!isValid || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors
            ${
              isValid && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <div className='flex items-center space-x-2'>
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              <span>Generating...</span>
            </div>
          ) : (
            'Generate Flashcards'
          )}
        </button>
      </div>
    </form>
  );
}
