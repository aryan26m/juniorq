'use client';

import { BookOpen, Code, TrendingUp, Users, FileText, Upload, Calendar, Trophy, Target, Clock, CheckCircle, AlertCircle, LayoutDashboard, BarChart2, User, NotebookPen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAssignmentProgress } from '@/contexts/AssignmentProgressContext';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Assignments', icon: FileText, href: '/assignments' },
  { name: 'Resources', icon: BookOpen, href: '/resources' },
  { name: 'Progress', icon: BarChart2, href: '/progress' },
  { name: 'Sessions', icon: Calendar, href: '/sessions' },
  { name: 'Quizzes', icon: Trophy, href: '/quizzes' },
  { name: 'Notes', icon: NotebookPen, href: '/notes' },
  { name: 'Profile', icon: User, href: '/profile' },
];

const statCards = [
  { label: 'Assignments Completed', value: 12, icon: FileText, color: 'text-success', bg: 'bg-dark-card' },
  { label: 'Total Points', value: 850, icon: Trophy, color: 'text-accent', bg: 'bg-dark-card' },
  { label: 'Streak Days', value: 7, icon: Target, color: 'text-primary', bg: 'bg-dark-card' },
  { label: 'Resources Uploaded', value: 3, icon: Upload, color: 'text-info', bg: 'bg-dark-card' },
];

export default function Dashboard() {
  const { assignments } = useAssignmentProgress();

  // Map assignments to recentAssignments format
  const recentAssignments = [
    {
      title: assignments.find(a => a.id === 'two-sum')?.title + ' - LeetCode',
      due: '2024-01-15',
      status: 'pending',
      points: assignments.find(a => a.id === 'two-sum')?.points,
      type: 'coding',
      difficulty: 'easy',
    },
    {
      title: 'Data Structures Quiz',
      due: '2024-01-16',
      status: 'completed',
      points: 30,
      type: 'quiz',
      difficulty: 'medium',
    },
    {
      title: 'Essay: AI in Education',
      due: '2024-01-18',
      status: 'pending',
      points: 20,
      type: 'project',
      difficulty: 'medium',
    },
  ];

  const upcomingSessions = [
    { title: 'Algorithms Workshop', host: 'Dr. Sarah Chen', time: '2024-01-15 15:00', type: 'group' },
    { title: 'System Design Prep', host: 'Alex Rodriguez', time: '2024-01-16 10:00', type: 'one-on-one' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Ayush', points: 1200, streak: 15 },
    { rank: 2, name: 'Deepraj', points: 1150, streak: 12 },
    { rank: 3, name: 'Mahek', points: 1100, streak: 10 },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: 'url("/juniorq-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-dark-sidebar text-white flex flex-col py-8 px-4 min-h-screen">
        <div className="flex items-center mb-10">
          <span className="text-2xl font-bold tracking-wide text-primary">JuniorQ</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="flex items-center px-4 py-3 rounded-lg hover:bg-dark-lighter transition-colors group">
                  <item.icon className="mr-3 h-5 w-5 text-accent group-hover:text-primary" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 border-t border-dark-lighter pt-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">Student Name</div>
              <div className="text-xs text-gray-400">Student</div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-dark px-8 py-8 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <div key={idx} className={`rounded-xl p-6 ${card.bg} shadow flex flex-col gap-2`}>
              <div className="flex items-center gap-3">
                <card.icon className="h-6 w-6 text-accent" />
                <span className="text-lg font-semibold text-white">{card.value}</span>
              </div>
              <div className="text-gray-400 text-sm mt-2">{card.label}</div>
            </div>
          ))}
        </div>
        {/* Main Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Assignments */}
          <div className="col-span-1 bg-dark-card rounded-xl p-6 shadow">
            <h2 className="text-lg font-bold text-white mb-4">Recent Assignments</h2>
            <ul className="space-y-4">
              {recentAssignments.map((a, i) => (
                <li key={i} className="flex flex-col gap-1 p-4 rounded-lg bg-dark-lighter">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="font-semibold text-white">{a.title}</span>
                    <span className="ml-auto text-xs px-2 py-1 rounded bg-dark-card text-gray-300">{a.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Due: {a.due}</span>
                    <span className="ml-auto">Points: <span className="text-success font-bold">{a.points}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Upcoming Sessions */}
          <div className="col-span-1 bg-dark-card rounded-xl p-6 shadow">
            <h2 className="text-lg font-bold text-white mb-4">Upcoming Sessions</h2>
            <ul className="space-y-4">
              {upcomingSessions.map((s, i) => (
                <li key={i} className="flex flex-col gap-1 p-4 rounded-lg bg-dark-lighter">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="font-semibold text-white">{s.title}</span>
                    <span className="ml-auto text-xs px-2 py-1 rounded bg-dark-card text-gray-300">{s.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Host: {s.host}</span>
                    <span className="ml-auto">{s.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Leaderboard */}
          <div className="col-span-1 bg-dark-card rounded-xl p-6 shadow">
            <h2 className="text-lg font-bold text-white mb-4">Leaderboard</h2>
            <ul className="space-y-4">
              {leaderboard.map((l, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-lighter">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-card text-primary font-bold">{l.rank}</span>
                  <span className="font-semibold text-white">{l.name}</span>
                  <span className="ml-auto text-xs text-success">{l.points} pts</span>
                  <span className="ml-2 text-xs text-warning">🔥 {l.streak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
