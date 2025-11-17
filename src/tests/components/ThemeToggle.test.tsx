import { render, screen } from '@testing-library/react';
import { ModeToggle } from '@/components/theme-toggle';

const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

// Mock apenas os componentes UI necessários
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe('ModeToggle Component', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('should render theme toggle button', () => {
    render(<ModeToggle />);

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<ModeToggle />);

    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });
});
