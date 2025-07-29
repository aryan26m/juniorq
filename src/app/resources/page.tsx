'use client';

import { useState } from 'react';

const resources = [
  {
    title: 'Array',
    videos: [
      {
        label: 'Complete Array in Hindi (YouTube Lecture)',
        link: 'https://www.youtube.com/watch?v=Zg4-uSjxosE',
        id: 'array-1',
      },
    ],
  },
  {
    title: 'String',
    videos: [
      {
        label: 'String Data Structure in Hindi (YouTube Lecture)',
        link: 'https://www.youtube.com/watch?v=Q2Tw6gcVEwc',
        id: 'string-1',
      },
    ],
  },
  {
    title: 'STL (Standard Template Library)',
    videos: [
      {
        label: 'STL Playlist by Luv (Hindi, YouTube Playlist)',
        link: 'https://www.youtube.com/watch?v=R5BEcvTVZj0&list=PLauivoElc3gh3RCiQA82MDI-gJfXQQVnn',
        id: 'stl-luv-playlist',
      },
    ],
  },
  {
    title: 'HTML',
    videos: [
      {
        label: 'HTML Full Course in Hindi (YouTube Lecture)',
        link: 'https://www.youtube.com/watch?v=BsDoLVMnmZs',
        id: 'html-1',
      },
    ],
  },
  {
    title: 'CSS',
    videos: [
      {
        label: 'CSS Full Course in Hindi (YouTube Lecture)',
        link: 'https://www.youtube.com/watch?v=Edsxf_NBFrw',
        id: 'css-1',
      },
    ],
  },
];

export default function ResourcesPage() {
  const [done, setDone] = useState<{ [id: string]: boolean }>({});

  const handleToggle = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-dark-card text-white rounded-xl shadow-lg p-8 border border-dark-lighter">
      <h1 className="text-3xl font-bold mb-8 text-primary">Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res) => (
          <div
            key={res.title}
            className="bg-dark-lighter rounded-xl p-6 border-2 border-white shadow-lg flex flex-col gap-4 transition-all duration-200 hover:shadow-2xl hover:border-primary/80 hover:ring-2 hover:ring-primary/30"
          >
            <h2 className="text-xl font-semibold text-accent mb-1">{res.title}</h2>
            {res.videos.map((video) => (
              <div key={video.id} className="flex items-center justify-between border-b border-dark-card pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <div>
                  <p className="text-gray-300 mb-1">{video.label}</p>
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-accent transition-colors w-max"
                  >
                    Watch Lecture
                  </a>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={!!done[video.id]}
                    onChange={() => handleToggle(video.id)}
                    className="form-checkbox h-5 w-5 text-success bg-dark-card border-gray-600 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-success text-xl">
                    {done[video.id] ? '✔️' : ''}
                  </span>
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 