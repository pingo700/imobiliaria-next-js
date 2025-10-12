import { redirect } from 'next/navigation';
export default async function MainAdmin() {
    redirect('/admin/dashboard');
}