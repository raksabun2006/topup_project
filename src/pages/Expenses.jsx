import SEO from '../components/SEO';
import ExpenseList from '../components/expenses/ExpenseList';

export default function Expenses() {
  return (
    <>
      <SEO title="ការគ្រប់គ្រងចំណាយ (Expenses) | Mart System" robots="noindex, nofollow" />
      <div className="flex-1 overflow-y-auto bg-[#F7F9FA] dark:bg-slate-950 p-3.5 sm:p-5 lg:p-6">
        <ExpenseList />
      </div>
    </>
  );
}
