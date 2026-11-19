import AdminShell from '@/components/admin/AdminShell';
import { requireAuthenticatedAdmin } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const access = await requireAuthenticatedAdmin();

    return (
        <AdminShell permissions={access.permissions}>{children}</AdminShell>
    )
}
