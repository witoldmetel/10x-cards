import { render, screen } from '@testing-library/react';
import { CollectionIcon } from '../CollectionIcon';

describe('CollectionIcon', () => {
  it('renders with default props', () => {
    render(<CollectionIcon />);
    const iconContainer = screen.getByRole('generic');
    
    expect(iconContainer).toHaveStyle({ backgroundColor: '#60a5fa' });
    expect(iconContainer).toHaveClass('w-8 h-8');
  });

  it('renders with custom color', () => {
    render(<CollectionIcon color="#ff0000" />);
    const iconContainer = screen.getByRole('generic');
    
    expect(iconContainer).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('renders with small size', () => {
    render(<CollectionIcon size="sm" />);
    const iconContainer = screen.getByRole('generic');
    
    expect(iconContainer).toHaveClass('w-6 h-6');
  });

  it('renders with large size', () => {
    render(<CollectionIcon size="lg" />);
    const iconContainer = screen.getByRole('generic');
    
    expect(iconContainer).toHaveClass('w-10 h-10');
  });

  it('applies custom className', () => {
    render(<CollectionIcon className="custom-class" />);
    const iconContainer = screen.getByRole('generic');
    
    expect(iconContainer).toHaveClass('custom-class');
  });
}); 