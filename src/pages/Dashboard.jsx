import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import StaffDashboard from './StaffDashboard';
import CustomerDashboard from './CustomerDashboard';
import SEO from '../components/SEO';

export default function Dashboard() {
  const { role, isAdmin, isStaff } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isStaff) {
    return <StaffDashboard />;
  }

  return <CustomerDashboard />;
}