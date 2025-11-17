import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('Not Found Page', () => {
  it('should render error 404 badge', () => {
    render(<NotFound />);

    // Usa getAllByText e pega o primeiro elemento do badge
    const errorElements = screen.getAllByText(/erro 404/i);
    expect(errorElements[0]).toBeInTheDocument();
  });

  it('should render not found heading', () => {
    render(<NotFound />);

    expect(screen.getByText('Não Encontrado')).toBeInTheDocument();
  });

  it('should render description text', () => {
    render(<NotFound />);

    expect(screen.getByText(/esse imóvel não existe/i)).toBeInTheDocument();
  });

  it('should render link to home', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /voltar para o início/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
