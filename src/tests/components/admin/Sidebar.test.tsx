import { render, screen } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin/dashboard'),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div>{children}</div>,
  SidebarHeader: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <nav>{children}</nav>,
  SidebarMenuButton: ({ children, asChild }: any) => asChild ? <>{children}</> : <button>{children}</button>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  useSidebar: () => ({ state: 'expanded' }),
}));

describe('AdminSidebar Component', () => {
  it('should render sidebar', () => {
    render(<AdminSidebar />);

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Imóveis')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });

  it('should render administration section', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Administração')).toBeInTheDocument();
  });

  it('should render site section', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('Ver Site')).toBeInTheDocument();
  });

  it('should have links with correct hrefs', () => {
    render(<AdminSidebar />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');

    const imoveisLink = screen.getByText('Imóveis').closest('a');
    expect(imoveisLink).toHaveAttribute('href', '/admin/imoveis');
  });
});
