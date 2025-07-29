import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { AssignmentProgressProvider } from '@/contexts/AssignmentProgressContext';

// Using a simpler font configuration
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'JuniorQ - KNIT Learning Platform',
  description: 'Comprehensive education platform for KNIT students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AssignmentProgressProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <footer className="bg-white border-t border-gray-200">
                  <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                    <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                      <div className="px-5 py-2">
                        <a href="/about" className="text-base text-gray-500 hover:text-gray-900">
                          About
                        </a>
                      </div>
                      <div className="px-5 py-2">
                        <a href="/blog" className="text-base text-gray-500 hover:text-gray-900">
                          Blog
                        </a>
                      </div>
                      <div className="px-5 py-2">
                        <a href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                          Contact
                        </a>
                      </div>
                    </nav>
                    <p className="mt-8 text-center text-base text-gray-400">
                      &copy; {new Date().getFullYear()} JuniorQ - KNIT Sultanpur. All rights reserved.
                    </p>
                  </div>
                </footer>
                <Toaster />
              </div>
            </AssignmentProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
