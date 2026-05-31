// src/hooks/useScrollReveal.js
// Hook tự động gắn IntersectionObserver – dùng class .reveal / .reveal-left

import { useEffect } from 'react';

/**
 * Gọi hook này trong bất kỳ trang/component nào để kích hoạt scroll animation.
 * Các element có class "reveal" hoặc "reveal-left" sẽ tự động hiện ra khi vào viewport.
 */
const useScrollReveal = () => {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-left');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // chỉ animate 1 lần
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

export default useScrollReveal;
