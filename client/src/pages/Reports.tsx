import Card from '../components/ui/Card';

const reports = [
  { order: '#1001', customer: 'Alex Johnson', status: 'Completed', total: '$24.00' },
  { order: '#1002', customer: 'Sam Wilson', status: 'Preparing', total: '$15.50' },
  { order: '#1003', customer: 'Taylor Smith', status: 'Pending', total: '$31.00' },
];

export default function Reports() {
  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Overview</p>
        <h2>Order Reports</h2>
      </div>

      <Card title="Recent orders">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: 'left', padding: 8 }}>
                  Order
                </th>
                <th scope="col" style={{ textAlign: 'left', padding: 8 }}>
                  Customer
                </th>
                <th scope="col" style={{ textAlign: 'left', padding: 8 }}>
                  Status
                </th>
                <th scope="col" style={{ textAlign: 'right', padding: 8 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.order}>
                  <td style={{ padding: 8 }}>{report.order}</td>
                  <td style={{ padding: 8 }}>{report.customer}</td>
                  <td style={{ padding: 8 }}>{report.status}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{report.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
