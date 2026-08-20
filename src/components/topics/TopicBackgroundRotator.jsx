import React, { useState, useEffect, memo } from 'react';

// 100% Authentic Indian (Desi) High-Quality Background Images ONLY
const TOPIC_IMAGES = {
  BOLLYWOOD: [
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1600&auto=format&fit=crop', // Indian Bollywood movie cinema
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop', // Indian cinema hall screen
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop', // Indian performance lights
  ],
  CRICKET: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1600&auto=format&fit=crop', // Indian cricket match stadium
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop', // Cricket pitch & stumps
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=1600&auto=format&fit=crop', // Indian cricket ball & grass
  ],
  ENTERTAINMENT: [
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1600&auto=format&fit=crop', // Bollywood film poster & cinema
    'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?q=80&w=1600&auto=format&fit=crop', // Indian festival & Diya lights
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop', // Indian celebration lights
  ],
  TECHNOLOGY: [
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop', // Digital India & Bengaluru Tech Hub
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop', // Tech innovation
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop', // Indian digital connectivity
  ],
  POLITICS: [
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1600&auto=format&fit=crop', // Indian Tricolor National Flag
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop', // India Gate & Sansad Bhavan lighting
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1600&auto=format&fit=crop', // Indian democratic monument
  ],
  SPORTS: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1600&auto=format&fit=crop', // Indian cricket & sports stadium
    'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=1600&auto=format&fit=crop', // Outdoor sports arena
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop', // Sports field
  ],
  LIFESTYLE: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop', // Taj Mahal Agra India
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop', // Jaipur Palace Hawa Mahal
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop', // Varanasi Ganga Ghats
  ],
  LIFE: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop', // Indian Taj Mahal heritage
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop', // Indian Pink City Jaipur
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop', // Indian spiritual Ghats
  ],
  GENERAL: [
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1600&auto=format&fit=crop', // Indian Flag
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop', // Taj Mahal
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop', // Jaipur Heritage
  ],
};

// Standalone fixed background layer component - changes ONLY its own div, NEVER re-renders user content
export const TopicBackgroundLayer = memo(function TopicBackgroundLayer({ topicName }) {
  const normTopic = (topicName || 'GENERAL').toUpperCase().trim();
  const allImages = Object.values(TOPIC_IMAGES).flat();
  const images = (normTopic === 'EXPLORE' || normTopic === 'ALL') ? allImages : (TOPIC_IMAGES[normTopic] || TOPIC_IMAGES.GENERAL);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(to bottom, rgba(245, 240, 236, 0.40), rgba(245, 240, 236, 0.65)), url("${images[activeIdx]}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 1s ease-in-out',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

export function TopicBackgroundRotator({ topicName, children, fullScreen = true }) {
  if (fullScreen) {
    return (
      <>
        <TopicBackgroundLayer topicName={topicName} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {children}
        </div>
      </>
    );
  }

  return children;
}
