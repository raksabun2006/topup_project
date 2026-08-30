import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/dashboard/UserDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import SEO from '../components/SEO';

/**
 * Route តែមួយ ផ្ទាំងពីរ។
 *
 * នេះជាការសម្រេចចិត្តខាង UI តែប៉ុណ្ណោះ។ សុវត្ថិភាពពិតនៅ backend:
 * ADMIN ឃើញ order ទាំងអស់ព្រោះ OrderServiceImpl ពិនិត្យ role
 * មិនមែនព្រោះ component នេះទេ។ អ្នកប្រើដែលកែ JavaScript ដើម្បី
 * បង្ហាញ AdminDashboard នៅតែទទួល 403 ពី API។
 */
export default function Dashboard() {
  const { isAdmin } = useAuth();
  return (
    <>
      <SEO
        title="ផ្ទាំងគ្រប់គ្រង (Dashboard) | Mart System"
        robots="noindex, nofollow"
      />
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}