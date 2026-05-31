import { RequireAdmin } from '@/components/auth/require-admin';
import { SettingsPage } from '@/features/settings/settings-page';
export default function Page() {
  return (
    <RequireAdmin>
      <SettingsPage />
    </RequireAdmin>
  );
}
