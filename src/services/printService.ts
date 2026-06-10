/**
 * Print Service
 * Utility service to trigger window.print() and render high-quality PDF reports
 * containing structured data tables formatted with professional CSS styles.
 */

import { addSystemLog } from './logger';

export interface PrintDataField {
  label: string;
  key: string;
  type?: 'text' | 'number' | 'status' | 'date';
}

export const PRINT_TABLE_STYLES = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    body {
      background: white !important;
      color: black !important;
      font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
  }

  /* Document Shell */
  .print-container {
    padding: 10px;
    color: #111;
  }

  /* Cover-like Formal Header */
  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #212c46;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .print-header img {
    height: 48px;
    object-fit: contain;
  }
  .print-header-text {
    text-align: right;
  }
  .print-header-text h1 {
    margin: 0;
    font-size: 18px;
    color: #212c46;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  .print-header-text p {
    margin: 4px 0 0 0;
    font-size: 9px;
    text-transform: uppercase;
    color: #7a8b95;
    font-weight: bold;
    letter-spacing: 0.1em;
  }

  /* Document Metadata Grid */
  .print-meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    background: #f8f9fa;
    border: 1px solid #eaeaec;
    border-radius: 8px;
    padding: 12px 16px;
  }
  .print-meta-item h5 {
    margin: 0 0 4px 0;
    font-size: 8px;
    text-transform: uppercase;
    color: #7a8b95;
    letter-spacing: 0.08em;
  }
  .print-meta-item p {
    margin: 0;
    font-size: 11px;
    font-weight: bold;
    color: #212c46;
  }

  /* Core Data CSS Print-Layout-Table Usage */
  .print-layout-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    page-break-inside: auto;
  }
  .print-layout-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  .print-layout-table th {
    background-color: #212c46 !important;
    color: #ffffff !important;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.05em;
    padding: 10px 12px;
    border: 1px solid #212c46;
    text-align: left;
  }
  .print-layout-table td {
    padding: 8px 12px;
    border: 1px solid #eaeaec;
    font-size: 10px;
    color: #333333;
  }
  .print-layout-table tr:nth-child(even) {
    background-color: #fcfbf9;
  }

  /* Printable Badges */
  .print-badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 8px;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #f3f4f6;
    color: #374151;
  }
  .print-badge-active {
    background-color: #dbeafe !important;
    color: #1e40af !important;
    border-color: #bfdbfe !important;
  }
  .print-badge-completed {
    background-color: #d1fae5 !important;
    color: #065f46 !important;
    border-color: #a7f3d0 !important;
  }
  .print-badge-pending {
    background-color: #fef3c7 !important;
    color: #92400e !important;
    border-color: #fde68a !important;
  }

  /* Formal Footer Stamp and Signature block */
  .print-footer-signature {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
  }
  .signature-box {
    width: 200px;
    text-align: center;
  }
  .signature-line {
    border-bottom: 1px solid #888;
    margin-bottom: 8px;
    height: 40px;
  }
  .signature-box p {
    margin: 0;
    font-size: 9px;
    color: #666;
  }
`;

export const printService = {
  /**
   * Triggers browser print on the current active window.
   * Can be used for printing an already visible styled container.
   */
  triggerPrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  },

  /**
   * Generates a printable PDF viewport on-the-fly from structured raw data arrays
   * utilizing pristine HTML structures and the requested '.print-layout-table' templates.
   */
  printTable(
    title: string,
    fields: PrintDataField[],
    data: any[],
    meta: { printedBy: string; role: string; [key: string]: string },
    logoUrl?: string
  ) {
    if (typeof window === 'undefined') return;

    // Create a printable popup or iframe context
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing document export. Please allow popups.');
      return;
    }

    const compiledRowsHtml = data
      .map((row) => {
        const cells = fields
          .map((f) => {
            const rawVal = row[f.key];
            if (f.type === 'status') {
              const statusClass =
                String(rawVal).toLowerCase() === 'active' || String(rawVal).toLowerCase() === 'กำลังอบรม'
                  ? 'print-badge-active'
                  : String(rawVal).toLowerCase() === 'completed' || String(rawVal).toLowerCase() === 'สำเร็จ'
                  ? 'print-badge-completed'
                  : 'print-badge-pending';
              return `<td><span class="print-badge ${statusClass}">${rawVal}</span></td>`;
            }
            return `<td>${rawVal !== undefined ? rawVal : ''}</td>`;
          })
          .join('\n');
        return `<tr>${cells}</tr>`;
      })
      .join('\n');

    const headersHtml = fields.map((f) => `<th>${f.label}</th>`).join('\n');

    // Build complete self-contained valid document layout
    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            ${PRINT_TABLE_STYLES}
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <img src="${logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}" alt="Company Icon">
              <div class="print-header-text">
                <h1>${title}</h1>
                <p>CHAISRI AGRO-INDUSTRIAL • OJT TRAINEE ARCHIVE</p>
              </div>
            </div>

            <div class="print-meta-grid">
              <div class="print-meta-item">
                <h5>Report Name</h5>
                <p>${title}</p>
              </div>
              <div class="print-meta-item">
                <h5>Export Timestamp</h5>
                <p>${new Date().toLocaleString()}</p>
              </div>
              <div class="print-meta-item">
                <h5>Authorized Issuer</h5>
                <p>${meta.printedBy} (${meta.role})</p>
              </div>
            </div>

            <table class="print-layout-table">
              <thead>
                <tr>
                  ${headersHtml}
                </tr>
              </thead>
              <tbody>
                ${compiledRowsHtml}
              </tbody>
            </table>

            <div class="print-footer-signature">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Prepared By</p>
                <p style="font-weight: bold; margin-top: 4px;">${meta.printedBy}</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>Authorized Controller Signature</p>
                <p style="font-weight: bold; margin-top: 4px;">Operations Manager</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(docHtml);
    printWindow.document.close();

    // Log the print action to our SystemLogs persistence
    addSystemLog(
      'Print Report',
      'PRINT_JOB',
      'Success',
      `Printed table report: "${title}" (${data.length} records)`,
      meta.printedBy,
      meta.role
    );
  }
};
