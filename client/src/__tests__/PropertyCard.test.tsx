import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

test('kartica prikazuje najvažnije podatke i vodi na detalje', () => {
  const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
  render(<QueryClientProvider client={client}><MemoryRouter><PropertyCard item={{ id: 12, naziv: 'Sunčan stan', tip_nekretnine: 'Stan', kvadratura: 72, cijena: 240000, lokacija: 'Sarajevo, Centar' }} /></MemoryRouter></QueryClientProvider>);
  expect(screen.getByRole('heading', { name: 'Sunčan stan' })).toBeInTheDocument();
  expect(screen.getByText('72 m²')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Sunčan stan|Otvori detalje/ })[0]).toHaveAttribute('href', '/nekretnine/12');
});
