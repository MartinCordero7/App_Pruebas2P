// Utilities for exporting data to Excel and PDF formats

export const exportToExcel = (data, filename = 'export.xlsx') => {
  // Convert data to CSV format
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (htmlContent, filename = 'export.pdf') => {
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          h1 { color: #2563eb; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csv.push(values.join(','));
  });

  return csv.join('\n');
};

export const generateReportHTML = (title, data, summary = null) => {
  let html = `<h1>${title}</h1>`;
  
  if (summary) {
    html += '<h2>Resumen</h2><ul>';
    Object.entries(summary).forEach(([key, value]) => {
      html += `<li><strong>${key}:</strong> ${value}</li>`;
    });
    html += '</ul>';
  }

  html += '<table>';
  html += '<thead><tr>';
  
  if (Array.isArray(data) && data.length > 0) {
    Object.keys(data[0]).forEach((key) => {
      html += `<th>${key}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.forEach((row) => {
      html += '<tr>';
      Object.values(row).forEach((value) => {
        html += `<td>${value || '-'}</td>`;
      });
      html += '</tr>';
    });
  }

  html += '</tbody></table>';
  return html;
};
