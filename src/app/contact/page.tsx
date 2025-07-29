"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I get started with JuniorQ?',
    answer: 'Just register with your KNIT email and you can start using all features instantly.'
  },
  {
    question: 'Is JuniorQ free for all students?',
    answer: 'Yes, JuniorQ is completely free for all KNIT Sultanpur students.'
  },
  {
    question: 'Can I join live sessions from my phone?',
    answer: 'Absolutely! JuniorQ is fully responsive and works on all devices.'
  },
  {
    question: 'Who do I contact for technical support?',
    answer: 'Use the form below or email support@juniorq.com and our team will help you.'
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // You would typically send this data to your backend here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradientFrom to-gradientTo text-white">
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-2">
            Contact JuniorQ Team
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Have questions, feedback, or need help? Reach out to us below!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-dark-card rounded-xl p-8 shadow flex flex-col gap-6">
            <h2 className="text-xl font-bold text-primary mb-2">Send us a message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded bg-dark-lighter text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Full name"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded bg-dark-lighter text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Email"
              />
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded bg-dark-lighter text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a subject</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Feedback">Feedback</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded bg-dark-lighter text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your message"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 rounded bg-primary text-white font-semibold shadow hover:scale-105 transition-transform"
              >
                Submit
              </button>
            </form>
            <div className="mt-6 text-sm text-gray-400">
              Or email us at <span className="text-accent">support@juniorq.com</span>
            </div>
          </div>
          {/* FAQ Section */}
          <div className="bg-dark-card rounded-xl p-8 shadow flex flex-col gap-6">
            <h2 className="text-xl font-bold text-accent mb-2">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-info" />
                    <span className="font-semibold text-white">{faq.question}</span>
                  </div>
                  <p className="text-gray-300 ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
