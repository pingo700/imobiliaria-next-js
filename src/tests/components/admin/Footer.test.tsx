import { render, screen } from '@testing-library/react';
import { FooterAdmin } from '@/components/admin/footer';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>,
  },
}));

describe('FooterAdmin Component', () => {
  it('should render footer', () => {
    const { container } = render(<FooterAdmin />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should display copyright with current year', () => {
    render(<FooterAdmin />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('should display company name', () => {
    render(<FooterAdmin />);

    expect(screen.getByText(/Imobiliária Sistema/i)).toBeInTheDocument();
  });

  it('should display rights reserved text', () => {
    render(<FooterAdmin />);

    expect(screen.getByText(/Todos os direitos reservados/i)).toBeInTheDocument();
  });
});
