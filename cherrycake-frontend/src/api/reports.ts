import { api } from './client';

export type ReportFilters = { from: string; to: string; region?: string; groupBy: 'REGION' | 'MONTH' };
export type SalesReport = {
  kpi: { ordersCount: number; subtotalSum: number; vatSum: number; discountSum: number; totalSum: number };
  rows: { label: string; ordersCount: number; total: number }[];
  currencyCode: string | null;
};

export async function getSalesReport(filters: ReportFilters, signal?: AbortSignal): Promise<SalesReport> {
  const { data } = await api.get<SalesReport>('/reports/sales', { params: filters, signal });
  return data;
}

export async function downloadSalesPdf(filters: ReportFilters): Promise<void> {
  const { data } = await api.get<Blob>('/reports/export', {
    params: { ...filters, format: 'PDF' }, responseType: 'blob', timeout: 60000,
  });
  download(data, `cherry-cake-sales-${filters.from}-${filters.to}.pdf`);
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSalesCsv(report: SalesReport) {
  const lines = [
    ['Metric', 'Value'],
    ...Object.entries(report.kpi).map(([key, value]) => [key, String(value)]),
    ['currencyCode', report.currencyCode ?? 'No sales'],
    [], ['Label', 'Orders', 'Total'],
    ...report.rows.map(row => [row.label, String(row.ordersCount), row.total.toFixed(2)]),
  ];
  const csv = lines.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'cherry-cake-sales.csv');
}
