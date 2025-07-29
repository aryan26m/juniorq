import { Sidebar } from '@/components/sidebar';
import { LayoutDashboard, FileText, BookOpen, BarChart2, Calendar, Trophy, NotebookPen, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <main className="min-h-screen">
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
