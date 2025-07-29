import Link from 'next/link';
import { Users } from 'lucide-react';

const team = [
  {
    name: 'Aryan',
    role: 'Backend & Platform Architect',
    image: '/aryan-photo.jpg',
    bio: 'Leads backend, authentication, and scalable architecture for JuniorQ.'
  },
  {
    name: 'Ayush',
    role: 'Frontend & UI/UX Lead',
    image: '/avatars/ayush.jpg',
    bio: 'Designs beautiful, modern interfaces and ensures a seamless user experience.'
  },
  {
    name: 'Ayushi',
    role: 'Product & Community Manager',
    image: '/avatars/ayushi.jpg',
    bio: 'Connects with students, gathers feedback, and shapes the product vision.'
  },
  {
    name: 'Deepraj',
    role: 'DevOps & Integrations',
    image: '/avatars/deepraj.jpg',
    bio: 'Handles deployments, cloud, and third-party integrations for reliability.'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradientFrom to-gradientTo text-white">
      {/* Hero */}
      <div className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 py-24">
        <div className="z-10 md:w-1/2">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            About JuniorQ
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Empowering KNIT students with a collaborative, modern learning platform built by students, for students.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center mt-12 md:mt-0">
          {/* Illustration replaced with public image */}
          <img
            src="/juniorq-bg.png"
            alt="JuniorQ About Hero"
            className="w-[350px] h-[260px] object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      {/* Mission & Vision */}
      <div className="py-16 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-dark-card rounded-xl p-6 shadow flex flex-col gap-3">
              <h3 className="text-lg font-bold text-primary mb-2">Mission</h3>
              <p className="text-gray-300">To make quality education, mentorship, and resources accessible to every KNIT student through technology and community.</p>
            </div>
            <div className="bg-dark-card rounded-xl p-6 shadow flex flex-col gap-3">
              <h3 className="text-lg font-bold text-accent mb-2">Vision</h3>
              <p className="text-gray-300">A thriving, collaborative student ecosystem where everyone can learn, grow, and succeed together.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Team */}
      <div className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-white text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((person) => (
              <div key={person.name} className="flex flex-col rounded-xl shadow-lg bg-dark-card overflow-hidden items-center text-center p-6">
                <img className="h-24 w-24 rounded-full object-cover mb-4 bg-dark-lighter" src={person.image} alt={person.name} />
                <p className="text-sm font-medium text-primary mb-1">{person.role}</p>
                <h3 className="text-xl font-semibold text-white mb-2">{person.name}</h3>
                <p className="text-gray-300">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-accent py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Join the JuniorQ Community</h2>
          <p className="mb-8 text-lg text-white/90">Be part of the education revolution. Together, we can make quality learning accessible to all at KNIT.</p>
          <Link href="/register" className="px-8 py-3 rounded-lg bg-white text-primary font-semibold shadow-lg hover:scale-105 transition-transform">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
