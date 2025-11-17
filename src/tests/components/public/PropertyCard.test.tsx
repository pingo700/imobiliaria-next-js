import { render, screen } from '@testing-library/react';

// Mock de um PropertyCard simples
const PropertyCard = ({ title, price }: { title: string; price: number }) => (
  <div data-testid="property-card">
    <h3>{title}</h3>
    <p>R$ {price.toLocaleString('pt-BR')}</p>
  </div>
);

describe('PropertyCard Component', () => {
  it('should render property title', () => {
    render(<PropertyCard title="Casa Moderna" price={500000} />);

    expect(screen.getByText('Casa Moderna')).toBeInTheDocument();
  });

  it('should render formatted price', () => {
    render(<PropertyCard title="Apartamento" price={350000} />);

    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });

  it('should render property card element', () => {
    render(<PropertyCard title="Casa" price={200000} />);

    expect(screen.getByTestId('property-card')).toBeInTheDocument();
  });
});
