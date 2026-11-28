import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api/client';
import { downloadSalesCsv, downloadSalesPdf, getSalesReport } from '../api/reports';
import type { ReportFilters, SalesReport } from '../api/reports';
import type { RootState } from '../store';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Radio from '../components/ui/Radio';
import Select from '../components/ui/Select';
import { useTranslation } from '../i18n/useTranslation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function Reports() {
  const { t } = useTranslation();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const isLight = theme === 'light';
  const [region, setRegion] = useState('UZB');
  const [grouping, setGrouping] = useState<ReportFilters['groupBy']>('MONTH');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return localDate(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  });
  const [endDate, setEndDate] = useState(() => localDate(new Date()));
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [regionsFailed, setRegionsFailed] = useState(false);
  const [result, setResult] = useState<{ key: string; report: SalesReport } | null>(null);
  // The failure is stored as a translation key so the message follows a later language switch.
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const filters = useMemo<ReportFilters>(() => ({
    from: startDate, to: endDate, region: region || undefined, groupBy: grouping,
  }), [startDate, endDate, region, grouping]);
  const key = JSON.stringify(filters);
  const invalidRange = !startDate || !endDate || startDate > endDate;
  const report = result?.key === key ? result.report : null;
  const error = invalidRange
    ? t('reports.invalidRange', 'Select a valid date range; start date must be on or before end date.')
    : failure?.key === key ? t(failure.message, 'Could not load sales. Please try changing the filters or reload the page.') : '';
  const loading = !invalidRange && !error && !report;

  const groupingOptions = useMemo(() => [
    { value: 'MONTH', label: t('reports.groupMonth', 'Month') },
    { value: 'REGION', label: t('reports.groupRegion', 'Region') },
  ] as const, [t]);

  useEffect(() => {
    const controller = new AbortController();
    api.get<{ code: string; name: string }[]>('/regions', { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setRegions(data); })
      .catch(() => { if (!controller.signal.aborted) setRegionsFailed(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!invalidRange) {
      getSalesReport(filters, controller.signal)
        .then(data => {
          if (!controller.signal.aborted) {
            setResult({ key, report: data });
            setFailure(null);
            setExportError('');
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailure({ key, message: 'reports.loadFailed' });
        });
    }
    return () => controller.abort();
  }, [filters, key, invalidRange]);

  async function exportPdf() {
    setExporting(true);
    setExportError('');
    try { await downloadSalesPdf(filters); }
    catch { setExportError('reports.pdfFailed'); }
    finally { setExporting(false); }
  }

  const labels = report?.rows.map(row => row.label) ?? [];
  const orders = report?.rows.map(row => row.ordersCount) ?? [];
  const revenue = report?.rows.map(row => row.total) ?? [];
  const currency = report?.currencyCode;
  const money = (value: number) => `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency && currency !== 'MIXED' ? ` ${currency}` : ''}`;
  const regionOptions = [
    { value: '', label: t('reports.allRegions', 'All regions') },
    ...regions.map(r => ({ value: r.code, label: `${r.name} (${r.code})` })),
  ];
  if (!regions.some(r => r.code === 'UZB')) regionOptions.push({ value: 'UZB', label: t('reports.uzbekistanFallback', 'Uzbekistan (UZB)') });

  const barData = {
    labels,
    datasets: [
      {
        label: t('reports.chartOrders', 'Orders'),
        data: orders,
        backgroundColor: 'rgba(230, 57, 96, 0.78)',
        borderColor: '#e63960',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: currency
          ? t('reports.chartRevenueCurrency', 'Revenue ({currency})', { currency })
          : t('reports.chartRevenue', 'Revenue'),
        data: revenue,
        borderColor: isLight ? '#c82348' : '#ffb7c5',
        backgroundColor: isLight ? 'rgba(200, 35, 72, 0.14)' : 'rgba(230, 57, 96, 0.2)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const tickColor = isLight ? '#642b3e' : '#c7a3b3';
  const gridColor = isLight ? 'rgba(120, 24, 48, 0.12)' : 'rgba(255, 183, 197, 0.12)';
  const legendColor = isLight ? '#2d0e1e' : '#fdf2f5';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: legendColor },
      },
    },
  };

  const kpis: [string, string][] = [
    [t('reports.kpiTotalRevenue', 'Total Revenue'), report ? money(report.kpi.totalSum) : '...'],
    [t('reports.kpiTotalOrders', 'Total Orders'), report ? String(report.kpi.ordersCount) : '...'],
    [t('reports.kpiAverageOrderValue', 'Average Order Value'), report ? money(report.kpi.averageOrderValue) : '...'],
    [t('reports.kpiSubtotal', 'Subtotal'), report ? money(report.kpi.subtotalSum) : '...'],
    [t('reports.kpiVat', 'VAT'), report ? money(report.kpi.vatSum) : '...'],
    [t('reports.kpiDiscount', 'Discount'), report ? money(report.kpi.discountSum) : '...'],
  ];

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">{t('reports.eyebrow', 'Business overview')}</p>
        <h2>{t('reports.title', 'Reports')}</h2>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {kpis.map(([label, value]) => (
          <Card key={label} title={label}>
            <strong style={{ fontSize: 28 }}>{value}</strong>
          </Card>
        ))}
      </div>

      {currency === 'MIXED' && <p role="note">{t('reports.mixedCurrencyNote', 'Totals combine stored local-currency amounts. Select one region for a single-currency report; no currency conversion is applied.')}</p>}
      {regionsFailed && <p role="alert">{t('reports.regionsFailed', 'Could not load countries. Reload the page to access all country filters.')}</p>}
      <Card title={t('reports.filters', 'Filters')}>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="report-start-date">{t('reports.startDate', 'Start date')}</label>
            <input
              id="report-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={{ minHeight: 44, padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="report-end-date">{t('reports.endDate', 'End date')}</label>
            <input
              id="report-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={{ minHeight: 44, padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Select
            label={t('reports.region', 'Region')}
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            options={regionOptions}
          />
          <fieldset style={{ display: 'flex', gap: 12, flexWrap: 'wrap', border: 0, padding: 0, margin: 0 }}>
            <legend style={{ width: '100%', marginBottom: 4 }}>{t('reports.groupBy', 'Group data by')}</legend>
            {groupingOptions.map((option) => (
              <Radio
                key={option.value}
                name="report-grouping"
                value={option.value}
                label={option.label}
                checked={grouping === option.value}
                onChange={() => setGrouping(option.value)}
              />
            ))}
          </fieldset>
        </div>
      </Card>

      {loading && <p role="status">{t('reports.loading', 'Loading sales report...')}</p>}
      {error && <p role="alert">{error}</p>}
      {report && !report.rows.length && <p role="status">{t('reports.empty', 'No orders match the selected filters.')}</p>}
      {report && <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <Card title={grouping === 'REGION' ? t('reports.ordersByRegion', 'Orders by region') : t('reports.ordersByMonth', 'Orders by month')}>
          <div style={{ height: 300 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>
        <Card title={t('reports.revenueTrend', 'Revenue trend')}>
          <div style={{ height: 300 }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </Card>
      </div>}

      <Card title={t('reports.export', 'Export report')}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button type="button" disabled={!report || Boolean(error)} onClick={() => report && downloadSalesCsv(report)}>{t('reports.downloadCsv', 'Download CSV')}</Button>
          <Button type="button" variant="secondary" disabled={!report || Boolean(error)} loading={exporting} onClick={exportPdf}>
            {t('reports.downloadPdf', 'Download PDF')}
          </Button>
        </div>
        {exportError && <p role="alert">{t(exportError, 'Could not download the PDF. Please try again.')}</p>}
      </Card>
    </section>
  );
}
