import Link from 'next/link';

const posts = [
  {
    id: 1,
    title: 'Mastering Dynamic Programming for Coding Interviews',
    excerpt: 'A practical guide to DP patterns, problem breakdown, and tips for acing DSA rounds.',
    date: 'June 15, 2024',
    author: 'Aryan',
    category: 'DSA',
    readTime: '7 min read'
  },
  {
    id: 2,
    title: 'How to Get Started with Competitive Programming',
    excerpt: 'Resources, platforms, and a roadmap for beginners to excel in CP contests.',
    date: 'June 10, 2024',
    author: 'Ayush',
    category: 'CP',
    readTime: '6 min read'
  },
  {
    id: 3,
    title: 'Building Your First Full-Stack Project at KNIT',
    excerpt: 'A step-by-step guide to building and deploying a MERN stack project for students.',
    date: 'June 5, 2024',
    author: 'Ayushi',
    category: 'Development',
    readTime: '8 min read'
  },
  {
    id: 4,
    title: 'Debugging Like a Pro: Tools and Mindset',
    excerpt: 'How to approach bugs, use VSCode, and leverage browser/dev tools for faster development.',
    date: 'May 28, 2024',
    author: 'Deepraj',
    category: 'Development',
    readTime: '5 min read'
  },
  {
    id: 5,
    title: 'Top 10 Must-Solve Graph Problems for Interviews',
    excerpt: 'Essential graph problems and patterns every student should master for placements.',
    date: 'May 20, 2024',
    author: 'Aryan',
    category: 'DSA',
    readTime: '6 min read'
  },
  {
    id: 6,
    title: 'Why Consistency Beats Intensity in CP Practice',
    excerpt: 'The science of spaced repetition, daily problem solving, and building long-term skill.',
    date: 'May 15, 2024',
    author: 'Ayush',
    category: 'CP',
    readTime: '4 min read'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradientFrom to-gradientTo text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">JuniorQ</span>
            <span className="block text-primary">Blog</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Insights, tips, and guides on CP, DSA, and development for KNIT students.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col overflow-hidden rounded-xl shadow-lg bg-dark-card">
              <div className="flex-shrink-0">
                <div className="h-48 w-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                  {post.title.charAt(0)}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent">
                    <span className="hover:underline">{post.category}</span>
                  </p>
                  <h3 className="text-xl font-semibold text-white mt-2 mb-1">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-base text-gray-300">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="h-10 w-10 rounded-full bg-dark-lighter flex items-center justify-center text-primary font-medium">
                      {post.author[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {post.author}
                    </p>
                    <div className="flex space-x-1 text-sm text-gray-400">
                      <time dateTime={post.date}>{post.date}</time>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
