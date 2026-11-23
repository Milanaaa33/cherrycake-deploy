import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactElement } from 'react';
import Reports from './Reports';
import type { SalesReport } from '../api/reports';
import { store } from '../store';

// Reports uses the translation hook (useSelector), so it must render inside the Redux Provider.
const render = (ui: ReactElement) => rtlRender(<Provider store={store}>{ui}</Provider>);

const mocks = vi.hoisted(() => ({ sales: vi.fn(), pdf: vi.fn(), csv: vi.fn(), get: vi.fn() }));
vi.mock('../api/client', () => ({ api: { get: mocks.get } }));
vi.mock('../api/reports', () => ({ getSalesReport: mocks.sales, downloadSalesPdf: mocks.pdf, downloadSalesCsv: mocks.csv }));
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: { data: unknown }) => <div data-testid="orders-chart">{JSON.stringify(data)}</div>,
  Line: ({ data }: { data: unknown }) => <div data-testid="revenue-chart">{JSON.stringify(data)}</div>,
}));

const report: SalesReport = {
  kpi: { ordersCount: 2, subtotalSum: 240, vatSum: 36, discountSum: 3, totalSum: 300.30, averageOrderValue: 150.15 },
  rows: [{ label: '2026-01', ordersCount: 2, total: 300.30 }], currencyCode: 'UZS',
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockResolvedValue({ data: [{ code: 'UZB', name: 'Uzbekistan' }, { code: 'GEO', name: 'Georgia' }] });
  mocks.sales.mockResolvedValue(report);
  mocks.pdf.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe('Sales reports', () => {
  it('renders actual API figures and feeds the same rows to both charts', async () => {
    render(<Reports />);
    await screen.findByText('300.30 UZS');
    expect(screen.getByTestId('orders-chart').textContent).toContain('2026-01');
    expect(screen.getByTestId('orders-chart').textContent).toContain('"data":[2]');
    expect(screen.getByTestId('revenue-chart').textContent).toContain('"data":[300.3]');
    expect(screen.queryByText('$12,480.00')).toBeNull();
  });

  it('shows the average order value from the API instead of calculating it', async () => {
    mocks.sales.mockResolvedValue({ ...report, kpi: { ...report.kpi, averageOrderValue: 111.11 } });
    render(<Reports />);
    await screen.findByText('111.11 UZS');
    expect(screen.queryByText('150.15 UZS')).toBeNull();
  });

  it('requests PDF using exactly the active date, region and grouping filters', async () => {
    render(<Reports />);
    await screen.findByText('300.30 UZS');
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-01-31' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Region' }), { target: { value: 'GEO' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Region' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Download PDF' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(mocks.pdf).toHaveBeenCalledWith({ from: '2026-01-01', to: '2026-01-31', region: 'GEO', groupBy: 'REGION' });
    expect(mocks.sales.mock.calls.at(-1)?.[0]).toEqual(mocks.pdf.mock.calls[0][0]);
  });

  it('prevents invalid ranges and disables export until current data is available', async () => {
    render(<Reports />);
    await screen.findByText('300.30 UZS');
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2099-01-01' } });
    expect(screen.getByRole('alert').textContent).toContain('valid date range');
    expect((screen.getByRole('button', { name: 'Download PDF' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows empty and mixed-currency reports without fabricated figures or dollar units', async () => {
    mocks.sales.mockResolvedValue({ ...report, rows: [], currencyCode: 'MIXED',
      kpi: { ordersCount: 0, subtotalSum: 0, vatSum: 0, discountSum: 0, totalSum: 0, averageOrderValue: 0 } });
    render(<Reports />);
    await screen.findByText('No orders match the selected filters.');
    expect(screen.getByRole('note').textContent).toContain('no currency conversion');
    expect(screen.getByTestId('revenue-chart').textContent).toContain('MIXED');
    expect(screen.queryByText('$12,480.00')).toBeNull();
  });

  it('shows API failures and prevents export of stale data', async () => {
    mocks.sales.mockRejectedValue(new Error('offline'));
    render(<Reports />);
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('Could not load sales');
    expect((screen.getByRole('button', { name: 'Download PDF' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('ignores late responses after the filters have changed', async () => {
    let finishFirst!: (data: SalesReport) => void;
    mocks.sales.mockImplementationOnce(() => new Promise<SalesReport>(resolve => { finishFirst = resolve; }));
    render(<Reports />);
    await screen.findByRole('option', { name: 'Georgia (GEO)' });
    fireEvent.change(screen.getByRole('combobox', { name: 'Region' }), { target: { value: 'GEO' } });
    await screen.findByText('300.30 UZS');
    await act(async () => finishFirst({ ...report, kpi: { ...report.kpi, totalSum: 999 } }));
    expect(screen.queryByText('999.00 UZS')).toBeNull();
    expect(screen.getByText('300.30 UZS')).toBeTruthy();
  });

  it('exports the loaded data as CSV and handles download failures', async () => {
    mocks.pdf.mockRejectedValue(new Error('download failed'));
    render(<Reports />);
    await screen.findByText('300.30 UZS');
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    expect(mocks.csv).toHaveBeenCalledWith(report);
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    await screen.findByText('Could not download the PDF. Please try again.');
  });
});
