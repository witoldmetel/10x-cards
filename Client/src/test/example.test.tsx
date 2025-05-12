import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('renders example component', () => {
    render(<div>Hello Test</div>);

    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
