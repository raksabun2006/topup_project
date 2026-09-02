/**
 * Standard Expense Categories
 */
export const EXPENSE_CATEGORIES = [
  { value: 'Rent', label: 'ថ្លៃជួល (Rent)', color: '#3B82F6' },
  { value: 'Salary', label: 'ប្រាក់ខែបុគ្គលិក (Salary)', color: '#10B981' },
  { value: 'Electricity', label: 'ថ្លៃភ្លើង (Electricity)', color: '#F59E0B' },
  { value: 'Water', label: 'ថ្លៃទឹក (Water)', color: '#06B6D4' },
  { value: 'Internet', label: 'ថ្លៃអ៊ីនធឺណិត (Internet)', color: '#8B5CF6' },
  { value: 'Transport', label: 'ថ្លៃដឹកជញ្ជូន (Transport)', color: '#EC4899' },
  { value: 'Supplies', label: 'សម្ភារៈប្រើប្រាស់ (Supplies)', color: '#64748B' },
  { value: 'Maintenance', label: 'ថ្លៃជួសជុល (Maintenance)', color: '#F97316' },
  { value: 'Marketing', label: 'ការផ្សព្វផ្សាយ (Marketing)', color: '#E11D48' },
  { value: 'Other', label: 'ផ្សេងៗ (Other)', color: '#94A3B8' },
];

export function getCategoryMeta(categoryName) {
  const match = EXPENSE_CATEGORIES.find(
    (c) => c.value.toLowerCase() === String(categoryName || '').toLowerCase()
  );
  return match || { value: categoryName || 'Other', label: categoryName || 'ផ្សេងៗ', color: '#94A3B8' };
}

/**
 * Ensures strict YYYY-MM-DD output without timezone offset anomalies.
 */
export function formatToDateString(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Quick Date Range Presets for Financial Reports
 */
export const DATE_PRESETS = [
  { id: 'today', label: 'ថ្ងៃនេះ' },
  { id: 'yesterday', label: 'ម្សិលមិញ' },
  { id: 'this_week', label: 'សប្តាហ៍នេះ' },
  { id: 'this_month', label: 'ខែនេះ' },
  { id: 'last_month', label: 'ខែមុន' },
  { id: 'custom', label: 'កំណត់ផ្ទាល់ខ្លួន' },
];

export function getDateRangeForPreset(presetId) {
  const now = new Date();
  const todayStr = formatToDateString(now);

  switch (presetId) {
    case 'today':
      return { from: todayStr, to: todayStr };

    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yStr = formatToDateString(yesterday);
      return { from: yStr, to: yStr };
    }

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const monday = new Date(now.setDate(diff));
      return { from: formatToDateString(monday), to: todayStr };
    }

    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: formatToDateString(firstDay), to: todayStr };
    }

    case 'last_month': {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: formatToDateString(firstDayLastMonth),
        to: formatToDateString(lastDayLastMonth),
      };
    }

    case 'custom':
    default:
      return { from: todayStr, to: todayStr };
  }
}
