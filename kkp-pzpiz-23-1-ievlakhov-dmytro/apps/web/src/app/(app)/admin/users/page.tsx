import { RequireAdmin } from '@/components/auth/require-admin';
import { UsersPage } from '@/features/admin/users-page';
export default function Page() {
  return (
    <RequireAdmin>
      <UsersPage />
    </RequireAdmin>
  );
}
