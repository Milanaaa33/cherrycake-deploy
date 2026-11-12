import { useState } from 'react';
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

type Grouping = 'daily' | 'weekly' | 'monthly';

const regionOptions = [
  { value: 'all', label: 'All regions' },
  { value: 'tashkent', label: 'Tashkent' },
  { value: 'samarkand', label: 'Samarkand' },
  { value: 'bukhara', label: 'Bukhara' },
];

const groupingOptions: ReadonlyArray<{ value: Grouping; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const chartLabels: Record<Grouping, string[]> = {
  daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
};

const chartOrders: Record<Grouping, number[]> = {
  daily: [18, 24, 21, 32, 28, 41, 36],
  weekly: [96, 124, 118, 142],
  monthly: [420, 510, 480, 620, 590, 680],
};

const chartRevenue: Record<Grouping, number[]> = {
  daily: [240, 320, 290, 420, 380, 560, 490],
  weekly: [1320, 1680, 1540, 1920],
  monthly: [5200, 6400, 6100, 7800, 7300, 8600],
};

function exportCsv() {
  const csv = 'Metric,Value\nTotal Revenue,$12480.00\nTotal Orders,680\nAverage Order Value,$18.35';
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cherry-cake-report.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [region, setRegion] = useState('all');
  const [grouping, setGrouping] = useState<Grouping>('weekly');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');

  const labels = chartLabels[grouping];
  const orders = chartOrders[grouping];
  const revenue = chartRevenue[grouping];

  const barData = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: orders,
        backgroundColor: '#c94c6d',
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenue,
        borderColor: '#7c3f58',
        backgroundColor: 'rgba(201, 76, 109, 0.16)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Business overview</p>
        <h2>Reports</h2>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {[
          ['Total Revenue', '$12,480.00'],
          ['Total Orders', '680'],
          ['Average Order Value', '$18.35'],
        ].map(([label, value]) => (
          <Card key={label} title={label}>
            <strong style={{ fontSize: 28 }}>{value}</strong>
          </Card>
        ))}
      </div>

      <Card title="Filters">
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'end',
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="report-start-date">Start date</label>
            <input
              id="report-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={{ minHeight: 44, padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label htmlFor="report-end-date">End date</label>
            <input
              id="report-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={{ minHeight: 44, padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Select
            label="Region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            options={regionOptions}
          />
          <fieldset style={{ display: 'flex', gap: 12, flexWrap: 'wrap', border: 0, padding: 0, margin: 0 }}>
            <legend style={{ width: '100%', marginBottom: 4 }}>Group data by</legend>
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

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card title="Orders by period">
          <div style={{ height: 300 }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>
        <Card title="Revenue trend">
          <div style={{ height: 300 }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <Card title="Export report">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button type="button" onClick={exportCsv}>Download CSV</Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Generate PDF
          </Button>
        </div>
      </Card>
    </section>
  );
}
