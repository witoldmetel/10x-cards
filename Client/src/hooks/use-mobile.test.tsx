import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from './use-mobile';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;
  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
    });
    vi.clearAllMocks();
  });

  it('should return true when screen width is less than mobile breakpoint', () => {
    const addEventListenerMock = vi.fn();
    mockMatchMedia.mockReturnValue({
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', { value: 767 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should return false when screen width is equal to mobile breakpoint', () => {
    const addEventListenerMock = vi.fn();
    mockMatchMedia.mockReturnValue({
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', { value: 768 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return false when screen width is greater than mobile breakpoint', () => {
    const addEventListenerMock = vi.fn();
    mockMatchMedia.mockReturnValue({
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'innerWidth', { value: 1024 });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerMock = vi.fn();
    mockMatchMedia.mockReturnValue({
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
}); 