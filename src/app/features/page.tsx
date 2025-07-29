import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      name: 'Resource Hub',
      description: 'Access a vast library of study materials, guides, and notes with our advanced search and filtering system.',
      icon: '📚',
      highlights: [
        'Bulk upload and download capabilities',
        'Advanced search with filters',
        'Categorized content for easy navigation'
      ]
    },
    {
      name: 'Assignment System',
      description: 'Streamline your workflow with our comprehensive assignment management system.',
      icon: '📝',
      highlights: [
        'Automated scheduling and reminders',
        'Multiple submission types (code, text, files)',
        'Integration with coding platforms',
        'Automated status checking'
      ]
    },
    {
      name: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      icon: '📊',
      highlights: [
        'Real-time statistics',
        'Performance analytics',
        'Achievement badges',
        'Nightly leaderboard updates'
      ]
    },
    {
      name: 'Live Sessions',
      description: 'Connect with mentors and peers through interactive video sessions.',
      icon: '🎥',
      highlights: [
        'Video streaming with chat',
        'Session scheduling',
        'Calendar integration',
        'Session recordings'
      ]
    },
    {
      name: 'Quiz System',
      description: 'Test your knowledge with our comprehensive quiz system.',
      icon: '📝',
      highlights: [
        'Live and practice quizzes',
        'Auto-grading system',
        'Performance analytics',
        'Leaderboards'
      ]
    },
    {
      name: 'Smart Notes',
      description: 'Transform your study materials with our AI-powered note-taking system.',
      icon: '📸',
      highlights: [
        'Image to text conversion',
        'Searchable notes',
        'Editable content',
        'Cloud sync'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <div className="bg-dark">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Powerful Features for</span>
              <span className="block text-primary">Modern Learning</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              JuniorQ is packed with features designed to enhance your learning experience and help you achieve your educational goals.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {features.map((feature, index) => (
              <div key={feature.name} className="relative">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                  <div className={`${index % 2 === 0 ? 'lg:order-first' : 'lg:order-last'}`}>
                    <div className="h-full flex items-center">
                      <div className="p-8 rounded-xl shadow-lg border bg-dark-card text-white border-dark-lighter">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-md text-xl mb-4 bg-primary/20 text-primary">
                          {feature.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{feature.name}</h2>
                        <p className="mt-2 text-gray-400">{feature.description}</p>
                        <ul className="mt-4 space-y-2">
                          {feature.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-400">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    {/* Empty space for alternating layout */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-white/90">
            Join thousands of students and mentors already using JuniorQ to enhance their education journey.
          </p>
          <Link href="/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 sm:w-auto transition-all duration-200">
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-sidebar border-t border-dark-lighter">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link href="/about" className="text-base text-gray-400 hover:text-white">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/blog" className="text-base text-gray-400 hover:text-white">
                Blog
              </Link>
            </div>

            <div className="px-5 py-2">
              <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} JuniorQ - KNIT Sultanpur. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
