import React from 'react';
import Loader from './Loader';

export interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T = any>({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}: TableProps<T>) {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid var(--cherry-border, rgba(255, 183, 197, 0.16))',
        borderRadius: 'var(--radius-md, 12px)',
        background: 'var(--cherry-card, #2d0e24)'
      }}
      className={className}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.88rem',
          minWidth: '500px',
          backgroundColor: 'transparent',
          color: 'var(--text-main, #fdf2f5)'
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--cherry-panel, rgba(35, 11, 28, 0.95))',
              borderBottom: '2px solid var(--cherry-border, rgba(255, 183, 197, 0.16))'
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                style={{
                  padding: '12px 16px',
                  fontWeight: 700,
                  color: 'var(--sakura-pink, #ffb7c5)',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  fontSize: '0.78rem'
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center' }}>
                <Loader />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--text-dim, #c7a3b3)'
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row: any, rIdx: number) => (
              <tr
                key={row.id || row.period || rIdx}
                style={{
                  borderBottom: '1px solid var(--cherry-border, rgba(255, 183, 197, 0.1))',
                  backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 183, 197, 0.04)'
                }}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--text-main, #fdf2f5)',
                      fontWeight: 500
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
