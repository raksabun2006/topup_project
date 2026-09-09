/**
 * Professional Excel & CSV Export Utility for Mart Accounting & Management
 * Supports full UTF-8 BOM encoding and XML Spreadsheet 2003 (.xls) format.
 * Features:
 *  - Native numeric and currency cells (ss:Type="Number") for instant Excel =SUM() & Pivot Tables
 *  - Khmer Unicode font support (Hanuman, Segoe UI, Arial)
 *  - Accounting Reconciliation Summary Sheet (Total Paid, Pending, Cancelled, Payment Breakdown, Channel Breakdown)
 *  - Verified Paid Transactions Sheet with double-line Accounting Total Row
 *  - Full Transaction Audit Trail Sheet
 */

import { formatCurrency, formatDate } from './format';
import { formatToDateString } from './dateFilter';

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes XML special characters
 */
function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escapes CSV field value according to RFC 4180
 */
function escapeCsv(val) {
  if (val == null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports tabular data as an Excel-compatible CSV file with UTF-8 BOM
 */
export function exportToCsv(rows, columns, fileName = 'export.csv') {
  if (!rows || rows.length === 0) {
    alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ (No data to export)');
    return;
  }

  const BOM = '\uFEFF'; // Byte Order Mark for Excel UTF-8 recognition
  const headers = columns.map((c) => escapeCsv(c.header)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        const formatted = c.format ? c.format(val, row) : val;
        return escapeCsv(formatted);
      })
      .join(',')
  );

  const csvContent = BOM + [headers, ...lines].join('\r\n');
  const safeFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  downloadFile(csvContent, safeFileName, 'text/csv;charset=utf-8;');
}

/**
 * Generates an XML Spreadsheet 2003 (.xls) file with rich styles, formulas, and multiple sheets
 */
export function exportToXlsXml(sheets, fileName = 'export.xls') {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Main Title -->
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="9" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <!-- Table Header Styles -->
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#009F6B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderDark">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="HeaderBlue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1D4ED8"/>
   </Borders>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
  </Style>
  <!-- Standard Cells -->
  <Style ss:ID="TextLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="TextCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <!-- Real Calculable Numbers & Currency (for Accountant Formulas) -->
  <Style ss:ID="Currency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="Percent">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="0.0%"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <!-- KPI Summary Boxes -->
  <Style ss:ID="KpiLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="9" ss:Bold="1" ss:Color="#64748B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValuePaid">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="12" ss:Bold="1" ss:Color="#059669"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValuePending">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="12" ss:Bold="1" ss:Color="#D97706"/>
   <Interior ss:Color="#FFFBEB" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValueCancelled">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="12" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValueTotal">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="12" ss:Bold="1" ss:Color="#2563EB"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BFDBFE"/>
   </Borders>
  </Style>
  <!-- Accounting Standard Total Rows (Top Thin Line, Bottom Double Line) -->
  <Style ss:ID="TotalLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="11" ss:Bold="1" ss:Color="#059669"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0.00"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
  </Style>
  <Style ss:ID="TotalNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
  </Style>
  <!-- Status Badges -->
  <Style ss:ID="StatusPaid">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="9" ss:Bold="1" ss:Color="#166534"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusPending">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="9" ss:Bold="1" ss:Color="#92400E"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusCancelled">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI, Hanuman, Arial" x:CharSet="0" ss:Size="9" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
   </Borders>
  </Style>
 </Styles>`;

  let sheetsXml = '';
  sheets.forEach((sheet) => {
    sheetsXml += `\n <Worksheet ss:Name="${sheet.name || 'Sheet1'}">\n  <Table>\n`;

    // 1. Title Block
    if (sheet.title) {
      const mergeCol = Math.max(3, (sheet.columns?.length || 4) - 1);
      sheetsXml += `   <Row ss:Height="26">\n    <Cell ss:StyleID="Title" ss:MergeAcross="${mergeCol}"><Data ss:Type="String">${escapeXml(sheet.title)}</Data></Cell>\n   </Row>\n`;
      if (sheet.subtitle) {
        sheetsXml += `   <Row ss:Height="18">\n    <Cell ss:StyleID="Subtitle" ss:MergeAcross="${mergeCol}"><Data ss:Type="String">${escapeXml(sheet.subtitle)}</Data></Cell>\n   </Row>\n`;
      }
      sheetsXml += `   <Row ss:Height="10"></Row>\n`;
    }

    // 2. Custom KPI / Summary Block (if present)
    if (sheet.kpiBlocks && sheet.kpiBlocks.length > 0) {
      sheet.kpiBlocks.forEach((block) => {
        sheetsXml += `   <Row ss:Height="24">\n`;
        sheetsXml += `    <Cell ss:StyleID="KpiLabel" ss:MergeAcross="1"><Data ss:Type="String">${escapeXml(block.label)}</Data></Cell>\n`;
        const valStyle = block.variant === 'paid' ? 'KpiValuePaid' : block.variant === 'pending' ? 'KpiValuePending' : block.variant === 'cancelled' ? 'KpiValueCancelled' : 'KpiValueTotal';
        const isNumeric = typeof block.value === 'number';
        const valType = isNumeric ? 'Number' : 'String';
        sheetsXml += `    <Cell ss:StyleID="${valStyle}"><Data ss:Type="${valType}">${isNumeric ? block.value : escapeXml(block.value)}</Data></Cell>\n`;
        if (block.extra) {
          sheetsXml += `    <Cell ss:StyleID="TextLeft"><Data ss:Type="String">${escapeXml(block.extra)}</Data></Cell>\n`;
        }
        sheetsXml += `   </Row>\n`;
      });
      sheetsXml += `   <Row ss:Height="12"></Row>\n`;
    }

    // 3. Column Headers
    if (sheet.columns && sheet.columns.length > 0) {
      const headerStyle = sheet.headerTheme === 'dark' ? 'HeaderDark' : sheet.headerTheme === 'blue' ? 'HeaderBlue' : 'Header';
      sheetsXml += `   <Row ss:Height="24">\n`;
      sheet.columns.forEach((col) => {
        sheetsXml += `    <Cell ss:StyleID="${headerStyle}"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
      });
      sheetsXml += `   </Row>\n`;
    }

    // 4. Data Rows
    (sheet.rows || []).forEach((row) => {
      sheetsXml += `   <Row ss:Height="20">\n`;
      (sheet.columns || []).forEach((col) => {
        const rawVal = row[col.key];
        const isNumeric = typeof rawVal === 'number' && !isNaN(rawVal) && !col.forceString;

        // Custom status badge
        if (col.isStatus) {
          const statusUpper = String(rawVal || '').toUpperCase();
          const badgeStyle = statusUpper === 'PAID' || statusUpper === 'COMPLETED' || statusUpper === 'DELIVERED'
            ? 'StatusPaid'
            : statusUpper === 'PENDING'
            ? 'StatusPending'
            : statusUpper === 'CANCELLED' || statusUpper === 'REFUNDED'
            ? 'StatusCancelled'
            : 'TextCenter';
          sheetsXml += `    <Cell ss:StyleID="${badgeStyle}"><Data ss:Type="String">${escapeXml(rawVal ?? '')}</Data></Cell>\n`;
          return;
        }

        // Currency or Number Style
        if (col.isCurrency) {
          const num = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal) || 0;
          sheetsXml += `    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${num}</Data></Cell>\n`;
          return;
        }

        if (col.isPercent) {
          const num = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal) || 0;
          sheetsXml += `    <Cell ss:StyleID="Percent"><Data ss:Type="Number">${num}</Data></Cell>\n`;
          return;
        }

        if (isNumeric) {
          sheetsXml += `    <Cell ss:StyleID="${col.align === 'center' ? 'TextCenter' : 'Number'}"><Data ss:Type="Number">${rawVal}</Data></Cell>\n`;
          return;
        }

        const formatted = col.format ? col.format(rawVal, row) : rawVal;
        const alignStyle = col.align === 'center' ? 'TextCenter' : 'TextLeft';
        sheetsXml += `    <Cell ss:StyleID="${alignStyle}"><Data ss:Type="String">${escapeXml(formatted ?? '')}</Data></Cell>\n`;
      });
      sheetsXml += `   </Row>\n`;
    });

    // 5. Total Footer Row (Accountant Double-Line Style)
    if (sheet.totalRow) {
      sheetsXml += `   <Row ss:Height="24">\n`;
      (sheet.columns || []).forEach((col, idx) => {
        if (idx === 0) {
          const mergeCols = sheet.totalRow.labelMerge || 1;
          const mergeAttr = mergeCols > 1 ? ` ss:MergeAcross="${mergeCols - 1}"` : '';
          sheetsXml += `    <Cell ss:StyleID="TotalLabel"${mergeAttr}><Data ss:Type="String">${escapeXml(sheet.totalRow.label || 'សរុប (TOTAL)')}</Data></Cell>\n`;
          return;
        }

        if (sheet.totalRow.labelMerge && idx < sheet.totalRow.labelMerge) {
          // Skipped due to merge across
          return;
        }

        const totalVal = sheet.totalRow[col.key];
        if (totalVal !== undefined) {
          if (col.isCurrency || sheet.totalRow.isCurrencyKey === col.key) {
            const num = typeof totalVal === 'number' ? totalVal : parseFloat(totalVal) || 0;
            sheetsXml += `    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${num}</Data></Cell>\n`;
          } else if (typeof totalVal === 'number') {
            sheetsXml += `    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalVal}</Data></Cell>\n`;
          } else {
            sheetsXml += `    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">${escapeXml(totalVal)}</Data></Cell>\n`;
          }
        } else {
          sheetsXml += `    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String"></Data></Cell>\n`;
        }
      });
      sheetsXml += `   </Row>\n`;
    }

    sheetsXml += `  </Table>\n </Worksheet>`;
  });

  const fullXml = xmlHeader + sheetsXml + '\n</Workbook>';
  const safeFileName = fileName.endsWith('.xls') ? fileName : `${fileName}.xls`;
  downloadFile(fullXml, safeFileName, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Calculates Comprehensive Accounting Summary for Sales & Orders
 */
export function calculateSalesAccountingSummary(salesList = []) {
  const paidList = [];
  const pendingList = [];
  const cancelledList = [];

  salesList.forEach((s) => {
    const status = String(s.status || '').toUpperCase();
    const payStatus = String(s.paymentStatus || '').toUpperCase();

    if (payStatus === 'PAID' || status === 'COMPLETED' || status === 'DELIVERED') {
      paidList.push(s);
    } else if (status === 'CANCELLED' || status === 'REFUNDED') {
      cancelledList.push(s);
    } else {
      pendingList.push(s);
    }
  });

  const totalPaidRevenue = paidList.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalPendingAmount = pendingList.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalCancelledAmount = cancelledList.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const grossInvoicedAmount = salesList.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const totalPaidItems = paidList.reduce(
    (sum, s) => sum + (s.items?.reduce((isum, i) => isum + Number(i.quantity || i.qty || 1), 0) || s.items?.length || 1),
    0
  );

  // Payment Methods Breakdown (from Paid orders)
  const methodMap = new Map();
  paidList.forEach((s) => {
    const rawMethod = String(s.paymentMethod || 'CASH').toUpperCase();
    const method = rawMethod.includes('KHQR') || rawMethod.includes('BAKONG') ? 'Bakong KHQR (បាគង)'
      : rawMethod.includes('CARD') || rawMethod.includes('VISA') || rawMethod.includes('MASTER') ? 'កាតធនាគារ (Card)'
      : rawMethod.includes('CASH') ? 'សាច់ប្រាក់សុទ្ធ (Cash)'
      : rawMethod;

    const prev = methodMap.get(method) || { method, count: 0, amount: 0 };
    prev.count += 1;
    prev.amount += Number(s.total || 0);
    methodMap.set(method, prev);
  });

  const paymentMethodsBreakdown = Array.from(methodMap.values()).map((m) => ({
    ...m,
    share: totalPaidRevenue > 0 ? (m.amount / totalPaidRevenue) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Channels Breakdown (POS vs Online)
  const posPaid = paidList.filter((s) => s.type === 'POS');
  const onlinePaid = paidList.filter((s) => s.type === 'ONLINE');
  const posRevenue = posPaid.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const onlineRevenue = onlinePaid.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const channelBreakdown = [
    {
      channel: 'Point of Sale (លក់ក្នុងហាង POS)',
      count: posPaid.length,
      amount: posRevenue,
      share: totalPaidRevenue > 0 ? (posRevenue / totalPaidRevenue) : 0,
    },
    {
      channel: 'Online Store (ការបញ្ជាទិញអនឡាញ)',
      count: onlinePaid.length,
      amount: onlineRevenue,
      share: totalPaidRevenue > 0 ? (onlineRevenue / totalPaidRevenue) : 0,
    },
  ];

  // Cashier Reconciliation
  const cashierMap = new Map();
  paidList.forEach((s) => {
    const cashier = s.cashierName || s.cashier || (s.type === 'ONLINE' ? 'Online Store' : 'Staff');
    const prev = cashierMap.get(cashier) || { cashier, count: 0, amount: 0 };
    prev.count += 1;
    prev.amount += Number(s.total || 0);
    cashierMap.set(cashier, prev);
  });
  const cashierBreakdown = Array.from(cashierMap.values()).sort((a, b) => b.amount - a.amount);

  return {
    totalSalesCount: salesList.length,
    paidList,
    pendingList,
    cancelledList,
    totalPaidRevenue,
    totalPendingAmount,
    totalCancelledAmount,
    grossInvoicedAmount,
    totalPaidItems,
    paymentMethodsBreakdown,
    channelBreakdown,
    cashierBreakdown,
  };
}

/**
 * Export Orders & Sales List to Excel with Accountant Reconciliation & Total Paid calculations
 */
export function exportOrdersAndSalesToExcel(salesList = [], customName = 'Mart_Orders_Sales') {
  if (!salesList || salesList.length === 0) {
    alert('មិនមានទិន្នន័យសម្រាប់ Export ទេ (No data to export)');
    return;
  }

  const nowStr = formatToDateString(new Date());
  const formattedDateTime = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const accounting = calculateSalesAccountingSummary(salesList);

  // -------------------------------------------------------------
  // Sheet 1: Accounting & Executive Summary (សង្ខេបគណនេយ្យ & ផ្ទៀងផ្ទាត់)
  // -------------------------------------------------------------
  const kpiBlocks = [
    {
      label: 'ចំណូលសរុបបានបង់ប្រាក់ (TOTAL PAID REVENUE):',
      value: accounting.totalPaidRevenue,
      variant: 'paid',
      extra: `${accounting.paidList.length} ប្រតិបត្តិការជោគជ័យ (${accounting.totalPaidItems} ទំនិញបានលក់)`,
    },
    {
      label: 'ទឹកប្រាក់រង់ចាំទូទាត់ (TOTAL PENDING ORDERS):',
      value: accounting.totalPendingAmount,
      variant: 'pending',
      extra: `${accounting.pendingList.length} ការបញ្ជាទិញរង់ចាំ`,
    },
    {
      label: 'ទឹកប្រាក់បោះបង់/សងត្រឡប់ (TOTAL CANCELLED):',
      value: accounting.totalCancelledAmount,
      variant: 'cancelled',
      extra: `${accounting.cancelledList.length} ការបញ្ជាទិញបានបោះបង់`,
    },
    {
      label: 'ទឹកប្រាក់វិក្កយបត្រសរុបទាំងអស់ (GROSS INVOICED):',
      value: accounting.grossInvoicedAmount,
      variant: 'total',
      extra: `${accounting.totalSalesCount} វិក្កយបត្រសរុបក្នុងប្រព័ន្ធ`,
    },
  ];

  const payColumns = [
    { key: 'method', header: 'វិធីសាស្រ្តទូទាត់ (Payment Method)' },
    { key: 'count', header: 'ចំនួនវិក្កយបត្រ (Paid Orders)', align: 'center' },
    { key: 'amount', header: 'ទឹកប្រាក់ប្រមូលបាន (Total Paid Amount)', isCurrency: true },
    { key: 'share', header: 'ចំណែកភាគរយ (Revenue Share %)', isPercent: true },
  ];

  const channelColumns = [
    { key: 'channel', header: 'ប្រភពលក់ (Sales Channel)' },
    { key: 'count', header: 'ចំនួនវិក្កយបត្រ (Paid Orders)', align: 'center' },
    { key: 'amount', header: 'ចំណូលបានបង់ (Paid Revenue)', isCurrency: true },
    { key: 'share', header: 'ចំណែកភាគរយ (Share %)', isPercent: true },
  ];

  const cashierColumns = [
    { key: 'cashier', header: 'អ្នកគិតលុយ / បុគ្គលិក (Cashier / Channel)' },
    { key: 'count', header: 'ចំនួនវិក្កយបត្រ (Orders Processed)', align: 'center' },
    { key: 'amount', header: 'ទឹកប្រាក់សរុប (Total Collected)', isCurrency: true },
  ];

  // -------------------------------------------------------------
  // Sheet 2: Paid Transactions Only (ប្រតិបត្តិការបានបង់ប្រាក់ពិតប្រាកដ)
  // -------------------------------------------------------------
  const paidColumns = [
    { key: 'invoiceNumber', header: 'លេខវិក្កយបត្រ (Invoice #)' },
    { key: 'type', header: 'ប្រភព (Channel)', align: 'center' },
    { key: 'customerName', header: 'ឈ្មោះអតិថិជន (Customer)' },
    { key: 'createdAt', header: 'កាលបរិច្ឆេទ (Date & Time)', format: (v) => formatDate(v) },
    { key: 'cashierName', header: 'អ្នកគិតលុយ (Cashier)' },
    { key: 'paymentMethod', header: 'វិធីទូទាត់ (Payment Method)', align: 'center' },
    { key: 'paymentStatus', header: 'ស្ថានភាពទូទាត់', isStatus: true },
    {
      key: 'itemsCount',
      header: 'ចំនួនទំនិញ (Items Qty)',
      align: 'center',
      format: (_, r) => Number(r.items?.reduce((s, i) => s + Number(i.quantity || i.qty || 1), 0) || r.items?.length || 1),
    },
    { key: 'total', header: 'ទឹកប្រាក់បានបង់ (Paid Amount)', isCurrency: true },
  ];

  const paidTotalRow = {
    label: 'សរុបចំណូលបានបង់ប្រាក់ (TOTAL PAID REVENUE)',
    labelMerge: 7,
    itemsCount: accounting.totalPaidItems,
    total: accounting.totalPaidRevenue,
  };

  // -------------------------------------------------------------
  // Sheet 3: All Transactions Audit Trail (វិក្កយបត្រទាំងអស់)
  // -------------------------------------------------------------
  const allColumns = [
    { key: 'invoiceNumber', header: 'លេខវិក្កយបត្រ (Invoice #)' },
    { key: 'type', header: 'ប្រភព (Channel)', align: 'center' },
    { key: 'customerName', header: 'ឈ្មោះអតិថិជន (Customer)' },
    { key: 'createdAt', header: 'កាលបរិច្ឆេទ (Date & Time)', format: (v) => formatDate(v) },
    { key: 'cashierName', header: 'អ្នកគិតលុយ (Cashier)' },
    { key: 'paymentMethod', header: 'វិធីទូទាត់ (Payment Method)', align: 'center' },
    { key: 'paymentStatus', header: 'ស្ថានភាពទូទាត់', isStatus: true },
    { key: 'status', header: 'ស្ថានភាពបញ្ជាទិញ (Order Status)', isStatus: true },
    {
      key: 'itemsCount',
      header: 'ចំនួនទំនិញ (Qty)',
      align: 'center',
      format: (_, r) => Number(r.items?.reduce((s, i) => s + Number(i.quantity || i.qty || 1), 0) || r.items?.length || 1),
    },
    { key: 'total', header: 'ទឹកប្រាក់សរុប (Total Amount)', isCurrency: true },
  ];

  const allTotalRow = {
    label: 'សរុបវិក្កយបត្រទាំងអស់ (GROSS TOTAL INVOICED)',
    labelMerge: 8,
    total: accounting.grossInvoicedAmount,
  };

  exportToXlsXml(
    [
      {
        name: 'Accounting Summary',
        title: `របាយការណ៍សង្ខេបគណនេយ្យ Mart System - Reconciliation Summary`,
        subtitle: `កាលបរិច្ឆេទបង្កើត: ${formattedDateTime} | ចំនួនវិក្កយបត្រសរុប: ${accounting.totalSalesCount} | បានបង់ប្រាក់: $${accounting.totalPaidRevenue.toFixed(2)}`,
        headerTheme: 'dark',
        kpiBlocks,
        columns: payColumns,
        rows: accounting.paymentMethodsBreakdown,
        totalRow: {
          label: 'សរុបការទូទាត់តាមវិធីសាស្រ្ត (Total Payment Methods)',
          labelMerge: 1,
          count: accounting.paidList.length,
          amount: accounting.totalPaidRevenue,
          share: 1.0,
        },
      },
      {
        name: 'Paid Transactions',
        title: `បញ្ជីប្រតិបត្តិការបានបង់ប្រាក់ជោគជ័យ (Verified Paid Transactions)`,
        subtitle: `ចំណូលសរុបបានបង់: $${accounting.totalPaidRevenue.toFixed(2)} | ចំនួនប្រតិបត្តិការ: ${accounting.paidList.length} លើក`,
        headerTheme: 'default',
        columns: paidColumns,
        rows: accounting.paidList,
        totalRow: paidTotalRow,
      },
      {
        name: 'All Transactions Audit',
        title: `កំណត់ត្រាប្រតិបត្តិការ និងវិក្កយបត្រទាំងអស់ (Full Transactions Audit Trail)`,
        subtitle: `វិក្កយបត្រសរុប: ${accounting.totalSalesCount} | ទឹកប្រាក់សរុប: $${accounting.grossInvoicedAmount.toFixed(2)}`,
        headerTheme: 'blue',
        columns: allColumns,
        rows: salesList,
        totalRow: allTotalRow,
      },
    ],
    `${customName}_${nowStr}.xls`
  );
}

/**
 * Export Financial Analytics & Overview Report to Excel
 */
export function exportFinancialReportToExcel({
  dateRangeLabel,
  summaryCards = {},
  expenseBreakdown = [],
  paymentMethods = [],
  topProducts = [],
}) {
  const nowStr = formatToDateString(new Date());
  const formattedDateTime = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalRev = Number(summaryCards.revenue || 0);
  const totalExp = Number(summaryCards.expenses || 0);
  const netProf = Number(summaryCards.profit || (totalRev - totalExp));

  // Sheet 1: Financial KPI & Summary
  const kpiBlocks = [
    {
      label: 'ចំណូលសរុប (TOTAL REVENUE):',
      value: totalRev,
      variant: 'paid',
      extra: `${summaryCards.salesCount || 0} ប្រតិបត្តិការលក់`,
    },
    {
      label: 'ចំណាយសរុប (TOTAL EXPENSES):',
      value: totalExp,
      variant: 'cancelled',
      extra: 'ចំណាយប្រតិបត្តិការហាង',
    },
    {
      label: 'ចំណេញសុទ្ធ (NET PROFIT):',
      value: netProf,
      variant: netProf >= 0 ? 'paid' : 'cancelled',
      extra: totalRev > 0 ? `Margin: ${((netProf / totalRev) * 100).toFixed(1)}%` : '0%',
    },
    {
      label: 'ចំនួនប្រតិបត្តិការលក់ (SALES COUNT):',
      value: `${(summaryCards.salesCount || 0).toLocaleString()} លើក`,
      variant: 'total',
      extra: `ចន្លោះកាលបរិច្ឆេទ: ${dateRangeLabel || 'Today'}`,
    },
  ];

  // Sheet 2: Payment Methods Breakdown
  const paymentColumns = [
    { key: 'method', header: 'វិធីសាស្រ្តទូទាត់ (Payment Method)' },
    { key: 'count', header: 'ចំនួនប្រតិបត្តិការ (Transactions)', align: 'center' },
    { key: 'amount', header: 'ទឹកប្រាក់សរុប (Total Amount)', isCurrency: true },
  ];
  const paymentTotalAmount = paymentMethods.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paymentTotalCount = paymentMethods.reduce((sum, p) => sum + Number(p.count || 0), 0);

  // Sheet 3: Expense Breakdown
  const expenseColumns = [
    { key: 'category', header: 'ប្រភេទចំណាយ (Category)' },
    { key: 'count', header: 'ចំនួនប្រតិបត្តិការ (Count)', align: 'center' },
    { key: 'amount', header: 'ចំនួនទឹកប្រាក់ (Amount)', isCurrency: true },
  ];
  const expenseTotalAmount = expenseBreakdown.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const expenseTotalCount = expenseBreakdown.reduce((sum, e) => sum + Number(e.count || 0), 0);

  // Sheet 4: Top Products
  const productColumns = [
    { key: 'rank', header: 'ចំណាត់ថ្នាក់ (Rank)', align: 'center', format: (_, __, i) => String((i || 0) + 1) },
    { key: 'name', header: 'ឈ្មោះទំនិញ (Product Name)' },
    { key: 'quantitySold', header: 'ចំនួនបានលក់ (Units Sold)', align: 'center' },
    { key: 'revenue', header: 'ចំណូលសរុប (Revenue)', isCurrency: true },
  ];
  const productTotalUnits = topProducts.reduce((sum, p) => sum + Number(p.quantitySold || 0), 0);
  const productTotalRevenue = topProducts.reduce((sum, p) => sum + Number(p.revenue || 0), 0);

  exportToXlsXml(
    [
      {
        name: 'Financial KPI Summary',
        title: `របាយការណ៍សង្ខេបហិរញ្ញវត្ថុ Mart System (${dateRangeLabel || nowStr})`,
        subtitle: `កាលបរិច្ឆេទបង្កើត: ${formattedDateTime} | ចន្លោះកាលបរិច្ឆេទ: ${dateRangeLabel || 'All Time'}`,
        headerTheme: 'dark',
        kpiBlocks,
        columns: paymentColumns,
        rows: paymentMethods,
        totalRow: {
          label: 'សរុបតាមវិធីសាស្រ្តទូទាត់ (Total Payments)',
          count: paymentTotalCount,
          amount: paymentTotalAmount,
        },
      },
      {
        name: 'Expense Breakdown',
        title: 'ការបែងចែកចំណាយតាមប្រភេទ (Store Expense Breakdown)',
        subtitle: `ចំណាយសរុប: $${expenseTotalAmount.toFixed(2)} | ចំនួនប្រតិបត្តិការ: ${expenseTotalCount}`,
        headerTheme: 'dark',
        columns: expenseColumns,
        rows: expenseBreakdown,
        totalRow: {
          label: 'សរុបចំណាយទាំងអស់ (TOTAL EXPENSES)',
          count: expenseTotalCount,
          amount: expenseTotalAmount,
        },
      },
      {
        name: 'Top Selling Products',
        title: 'ផលិតផលលក់ដាច់បំផុត (Top Selling Products)',
        subtitle: `ចំណូលផលិតផលកំពូល: $${productTotalRevenue.toFixed(2)} | ចំនួនលក់: ${productTotalUnits} units`,
        headerTheme: 'default',
        columns: productColumns,
        rows: topProducts,
        totalRow: {
          label: 'សរុបផលិតផលលក់ដាច់ (Top Products Total)',
          labelMerge: 2,
          quantitySold: productTotalUnits,
          revenue: productTotalRevenue,
        },
      },
    ],
    `Mart_Financial_Report_${nowStr}.xls`
  );
}

/**
 * Export Monthly Statement to Excel
 */
export function exportMonthlyStatementToExcel(year, month, metrics = []) {
  const columns = [
    { key: 'title', header: 'មុខទំនិញ / សូចនាករ (Statement Line Item)' },
    { key: 'value', header: 'តម្លៃ (Value)' },
  ];

  exportToXlsXml(
    [
      {
        name: `Monthly Statement ${month}-${year}`,
        title: `របាយការណ៍ហិរញ្ញវត្ថុប្រចាំខែ ${month} ឆ្នាំ ${year} - Mart System`,
        subtitle: `របាយការណ៍បញ្ជាក់ចំណូល ចំណាយ និងប្រាក់ចំណេញប្រចាំខែ`,
        headerTheme: 'dark',
        columns,
        rows: metrics,
      },
    ],
    `Monthly_Statement_${year}_M${String(month).padStart(2, '0')}.xls`
  );
}

/**
 * Export Store Expenses List to Excel
 */
export function exportExpensesListToExcel(expensesList = [], customName = 'Mart_Expenses') {
  const nowStr = formatToDateString(new Date());
  const columns = [
    { key: 'expenseDate', header: 'កាលបរិច្ឆេទ (Date)', format: (v, r) => formatToDateString(v || r.createdAt) },
    { key: 'category', header: 'ប្រភេទចំណាយ (Category)' },
    { key: 'description', header: 'បរិយាយ / កំណត់ចំណាំ (Description)' },
    { key: 'amount', header: 'ចំនួនទឹកប្រាក់ (Amount)', isCurrency: true },
    { key: 'createdBy', header: 'កត់ត្រាដោយ (Recorded By)' },
  ];

  const totalExpenseAmount = expensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  exportToXlsXml(
    [
      {
        name: 'Expenses',
        title: `បញ្ជីចំណាយហាង Mart System - ${nowStr}`,
        subtitle: `ចំណាយសរុប: $${totalExpenseAmount.toFixed(2)} | ចំនួនប្រតិបត្តិការ: ${expensesList.length}`,
        headerTheme: 'dark',
        columns,
        rows: expensesList,
        totalRow: {
          label: 'សរុបចំណាយទាំងអស់ (TOTAL EXPENSES)',
          labelMerge: 3,
          amount: totalExpenseAmount,
        },
      },
    ],
    `${customName}_${nowStr}.xls`
  );
}

/**
 * Export Products Catalog List to Excel
 */
export function exportProductsListToExcel(productsList = [], categoriesMap, customName = 'Mart_Products_Catalog') {
  const nowStr = formatToDateString(new Date());
  const columns = [
    { key: 'barcode', header: 'បាកូដ (Barcode / SKU)' },
    { key: 'name', header: 'ឈ្មោះផលិតផល (Product Name)' },
    { key: 'category', header: 'ប្រភេទ (Category)', format: (v, r) => categoriesMap?.get(r.category || r.categoryId) || r.categoryName || r.category || v || '—' },
    { key: 'costPrice', header: 'ថ្លៃដើម (Cost Price)', isCurrency: true },
    { key: 'price', header: 'តម្លៃលក់ (Selling Price)', isCurrency: true },
    {
      key: 'stockQuantity',
      header: 'ស្តុកនៅសល់ (Stock Qty)',
      align: 'center',
      format: (v, r) => Number(r?.stockQuantity ?? r?.stock ?? r?.quantity ?? v ?? 0)
    },
    { key: 'status', header: 'ស្ថានភាព (Status)', align: 'center', format: (v) => v || 'ACTIVE' },
  ];

  const totalStockQty = productsList.reduce(
    (sum, p) => sum + Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0),
    0
  );
  const totalStockValuation = productsList.reduce(
    (sum, p) => sum + (Number(p.costPrice || p.price || 0) * Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0)),
    0
  );

  // Normalize row objects to ensure stockQuantity is always populated
  const normalizedRows = productsList.map((p) => ({
    ...p,
    stockQuantity: Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0),
  }));

  exportToXlsXml(
    [
      {
        name: 'Products Catalog',
        title: `កាតាឡុកទំនិញ Mart System Catalog - ${nowStr}`,
        subtitle: `ចំនួនមុខទំនិញសរុប: ${productsList.length} មុខ | ស្តុកសរុប: ${totalStockQty} units`,
        headerTheme: 'default',
        columns,
        rows: normalizedRows,
        totalRow: {
          label: 'សរុបស្តុកទំនិញទាំងអស់ (TOTAL STOCK)',
          labelMerge: 5,
          stockQuantity: totalStockQty,
        },
      },
    ],
    `${customName}_${nowStr}.xls`
  );
}
