'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <header className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="text-lg font-semibold">
            JuniorQ
          </Link>
          <span className="text-sm text-gray-500">| KNIT</span>
        </div>
      </header>
      {isOpen && (
        <div className="fixed inset-0 z-50 mt-14 bg-background lg:hidden">
          <Sidebar className="h-[calc(100vh-3.5rem)] w-full border-r" />
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
