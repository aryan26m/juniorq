"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, FileText, BarChart2, Calendar, Trophy, NotebookPen, Users, MessageCircle, HelpCircle } from 'lucide-react';

const features = [
  {
    title: 'Resource Hub',
    description: 'Access and share study materials, guides, and notes with advanced search and filtering.',
    icon: BookOpen,
    color: 'text-accent'
  },
  {
    title: 'Assignments',
    description: 'Submit solutions, track deadlines, and get automated status updates from coding platforms.',
    icon: FileText,
    color: 'text-primary'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with real-time statistics, analytics, and leaderboards.',
    icon: BarChart2,
    color: 'text-success'
  },
  {
    title: 'Live Sessions',
    description: 'Join interactive video sessions with seniors and peers, with calendar integration and reminders.',
    icon: Calendar,
    color: 'text-info'
  },
  {
    title: 'Quizzes',
    description: 'Practice with daily/weekly quizzes, instant scoring, and dynamic leaderboards.',
    icon: Trophy,
    color: 'text-warning'
  },
  {
    title: 'Smart Notes',
    description: 'Convert handwritten notes to searchable, editable text using Google Vision AI.',
    icon: NotebookPen,
    color: 'text-accent'
  },
];

const testimonials = [
  {
    name: 'Aryan',
    text: 'JuniorQ helped me organize my studies and connect with seniors for live sessions. The resource hub is a game changer!',
    avatar: '/aryan-photo.jpg',
  },
  {
    name: 'Ayush',
    text: 'The daily quizzes and leaderboard keep me motivated. I love tracking my progress and competing with friends!',
    avatar: '/avatars/ayush.jpg',
  },
  {
    name: 'Deepraj',
    text: 'Submitting assignments and getting instant feedback is so easy. JuniorQ makes learning fun and interactive.',
    avatar: '/avatars/deepraj.jpg',
  },
];

const faqs = [
  {
    question: 'Who can join JuniorQ?',
    answer: 'JuniorQ is exclusively for KNIT Sultanpur students and faculty.'
  },
  {
    question: 'Is JuniorQ free to use?',
    answer: 'Yes! JuniorQ is free for all KNIT students.'
  },
  {
    question: 'Can I access JuniorQ on my phone?',
    answer: 'Absolutely. JuniorQ is fully responsive and works on all devices.'
  },
  {
    question: 'How do I join live sessions?',
    answer: 'Just check the Sessions section after logging in and join any scheduled session with one click.'
  },
];

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradientFrom to-gradientTo">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url("/juniorq-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="backdrop-blur-md bg-white/60 dark:bg-black/60 rounded-xl shadow-lg p-8 border border-white/30 dark:border-black/30 max-w-md w-full text-center mt-32"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to JuniorQ</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">You're already logged in!</p>
          <Link href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-md font-medium shadow-lg hover:scale-105 transition-transform">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradientFrom to-gradientTo text-white">
      {/* Hero Section */}
      <div className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-24">
        <div className="z-10 md:w-1/2">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            JuniorQ: The Student Platform for KNIT
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Access resources, track your progress, join live sessions, and level up your learning journey—all in one place, exclusively for KNIT Sultanpur students.
          </p>
          <div className="flex gap-4">
            <Link href="/register" className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:scale-105 transition-transform ring-2 ring-primary/40">
              Get Started
            </Link>
            <Link href="/features" className="px-8 py-3 rounded-lg bg-dark-lighter text-white font-semibold shadow hover:bg-dark-card transition-colors">
              Learn More
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center mt-12 md:mt-0">
          {/* Illustration replaced with public image */}
          <img
            src="/juniorq-bg.png"
            alt="JuniorQ Hero"
            className="w-[350px] h-[260px] object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      {/* Features Section */}
      <div className="py-16 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-white">Everything you need to succeed at KNIT</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-6 shadow flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <span className="text-lg font-bold text-white">{feature.title}</span>
                </div>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Testimonials Section */}
      <div className="py-16 bg-dark">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">What students say about JuniorQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-6 shadow flex flex-col items-center text-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-24 h-24 rounded-full mb-2 bg-dark-lighter object-cover" />
                <MessageCircle className="h-6 w-6 text-accent mb-2" />
                <p className="text-gray-200 italic">“{t.text}”</p>
                <span className="mt-2 font-semibold text-primary">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="py-16 bg-dark-lighter">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-dark-card rounded-xl p-6 shadow flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-info" />
                  <span className="font-semibold text-white">{faq.question}</span>
                </div>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-accent py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to join JuniorQ?</h2>
          <p className="mb-8 text-lg text-white/90">Sign up now and unlock your full academic potential with the KNIT community.</p>
          <Link href="/register" className="px-8 py-3 rounded-lg bg-white text-primary font-semibold shadow-lg hover:scale-105 transition-transform">
            Sign Up for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
