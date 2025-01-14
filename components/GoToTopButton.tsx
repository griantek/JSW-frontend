'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowUp } from 'lucide-react';

export const GoToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-4 right-4 z-50 p-2 rounded-full bg-primary text-white shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
};
