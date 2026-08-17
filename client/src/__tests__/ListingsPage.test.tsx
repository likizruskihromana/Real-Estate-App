import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { ListingsPage } from '../pages/ListingsPage';

vi.mock('../lib/api', async () => {
  const actual=await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {...actual,apiEnvelope:vi.fn(async()=>({data:[{id:1,slug:'stan-1',naziv:'Test stan',tip_nekretnine:'Stan',kvadratura:60,cijena:200000,lokacija:'Sarajevo'}],meta:{page:1,pageSize:24,total:1,totalPages:1}})),api:vi.fn(async()=>[])};
});

function Location(){return <output data-testid="location">{useLocation().search}</output>}

test('filter mijenja URL koji je izvor stanja pretrage',async()=>{
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}});
 render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/nekretnine?lokacija=Sarajevo']}><ListingsPage/><Location/></MemoryRouter></QueryClientProvider>);
 expect(await screen.findByText('Test stan')).toBeInTheDocument();
 await userEvent.selectOptions(screen.getByLabelText('Tip nekretnine'),'Stan');
 await waitFor(()=>expect(screen.getByTestId('location')).toHaveTextContent('tip=Stan'));
});
