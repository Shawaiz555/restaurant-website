/**
 * printUtils.js
 * Utility for generating print-ready HTML and triggering window.print().
 * No React dependencies — pure JS, safe to call from any component.
 */
import store from '../store/store';

/**
 * Escapes a value for safe insertion into HTML.
 */
function escape(val) {
  if (val == null) return '—';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Opens a new window, writes a formatted HTML table, and triggers print.
 *
 * @param {object}   options
 * @param {string}   options.title           - Page title shown in the header
 * @param {Array}    options.columns         - Array of { header: string, render: (row, index) => string }
 * @param {Array}    options.rows            - Data rows to print
 * @param {string}   [options.subtitle]      - Optional filter summary line shown below header
 * @param {Function} [options.detailRenderer] - (row) => HTML string appended as a full-width detail row
 * @param {string}   [options.mode]           - 'print' (default) or 'pdf' (opens Save as PDF dialog)
 * @param {string}   [options.restaurantName] - Restaurant name shown in the header (default: 'Bites Restaurant')
 */
export function printTable({ title, columns, rows, subtitle, detailRenderer, mode = 'print', restaurantName }) {
  const name = restaurantName || store.getState()?.settings?.restaurant?.name || 'Bites Restaurant';
  const win = window.open('', '_blank', 'width=1000,height=750');
  if (!win) {
    alert('Please allow pop-ups to use the print feature.');
    return;
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const theadCells = columns.map((c) => `<th>${escape(c.header)}</th>`).join('');

  const tbodyRows = rows
    .map((row, i) => {
      const cells = columns
        .map((c) => {
          const val = c.render ? c.render(row, i) : row[c.key];
          return `<td>${escape(val)}</td>`;
        })
        .join('');
      const separatorStyle = i > 0 ? 'border-top:3px solid #1a1a1a;' : '';
      const mainRow = `<tr style="${separatorStyle}">${cells}</tr>`;
      if (!detailRenderer) return mainRow;
      const detail = detailRenderer(row);
      if (!detail) return mainRow;
      return `${mainRow}<tr><td colspan="${columns.length}" style="padding:0;border-bottom:3px solid #1a1a1a;">${detail}</td></tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escape(title)} — ${escape(name)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, Arial, sans-serif;
      font-size: 11px;
      color: #111;
      background: #fff;
    }
    @page { size: A4 landscape; margin: 15mm 12mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }

    .header {
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1a1a1a;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-left h1 {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header-left .restaurant {
      font-size: 10px;
      color: #666;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .header-right {
      text-align: right;
      font-size: 9.5px;
      color: #555;
      line-height: 1.6;
    }
    .subtitle {
      font-size: 10px;
      color: #555;
      margin-bottom: 10px;
      padding: 5px 8px;
      background: #f5f5f5;
      border-left: 3px solid #888;
      border-radius: 0 3px 3px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background: #1a1a1a;
      color: #fff;
    }
    th {
      text-align: left;
      padding: 7px 9px;
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      border-right: 1px solid #444;
    }
    th:last-child { border-right: none; }
    td {
      padding: 6px 9px;
      border-bottom: 1px solid #e8e8e8;
      border-right: 1px solid #e0e0e0;
      vertical-align: top;
      word-break: break-word;
      max-width: 200px;
      line-height: 1.4;
    }
    td:last-child { border-right: none; }
    tbody tr:nth-child(even) td { background: #f9f9f9; }
    tbody tr:last-child td { border-bottom: none; }

    .detail-box {
      background: #f7f7f7;
      padding: 8px 12px;
      font-size: 10px;
      color: #333;
    }
    .detail-box .detail-title {
      font-weight: 700;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #555;
      margin-bottom: 5px;
    }
    .detail-box table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 3px;
    }
    .detail-box table th {
      background: #e8e8e8;
      color: #333;
      font-size: 9px;
      padding: 4px 7px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .detail-box table td {
      padding: 4px 7px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 9.5px;
      max-width: none;
      background: transparent;
    }
    .detail-box table tr:last-child td { border-bottom: none; }
    .detail-note {
      margin-top: 5px;
      font-size: 9.5px;
      color: #555;
      font-style: italic;
    }

    .footer {
      margin-top: 14px;
      font-size: 9px;
      color: #999;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e0e0e0;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <p class="restaurant">${escape(name)} — Admin Report</p>
      <h1>${escape(title)}</h1>
    </div>
    <div class="header-right">
      <div>Generated: ${generatedAt}</div>
      <div>${rows.length} record${rows.length !== 1 ? 's' : ''}</div>
    </div>
  </div>
  ${subtitle ? `<p class="subtitle">Filters: ${escape(subtitle)}</p>` : ''}
  <table>
    <thead>
      <tr>${theadCells}</tr>
    </thead>
    <tbody>
      ${tbodyRows || '<tr><td colspan="' + columns.length + '" style="text-align:center;padding:20px;color:#999;">No records to print</td></tr>'}
    </tbody>
  </table>
  <div class="footer">
    <span>${escape(name)} — Confidential</span>
    <span>${escape(title)} · ${generatedAt}</span>
  </div>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    if (mode === 'pdf') {
      win.document.title = `${title} — ${name}`;
    }
    win.print();
  }, 150);
}

/**
 * Returns the subset of allRows matching selectedIds,
 * or all rows if no selection is made.
 *
 * @param {string[]} selectedIds
 * @param {object[]} allRows
 * @param {string}   idKey       - Field name used as row identifier (default: '_id')
 * @returns {object[]}
 */
export function getSelectionSummary(selectedIds, allRows, idKey = '_id') {
  if (!selectedIds || selectedIds.length === 0) return allRows;
  return allRows.filter((row) => selectedIds.includes(row[idKey]));
}
