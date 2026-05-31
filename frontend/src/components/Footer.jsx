// src/components/Footer.jsx
// Footer dùng chung

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-xs tracking-wide
                       py-12 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>spa</span>
          HealthyChat
        </Link>
        <p className="text-slate-500 text-center md:text-left">
          © {new Date().getFullYear()} HealthyChat. Medical Reliability &amp; Approachable Wellness.
        </p>
        <nav className="flex gap-4">
          {[
            { label: 'Privacy Policy',   to: '#' },
            { label: 'Terms of Service', to: '#' },
            { label: 'Support',          to: '#' },
            { label: 'Contact Us',       to: '#' },
          ].map(({ label, to }) => (
            <a key={label} href={to} onClick={(e) => e.preventDefault()}
               className="text-slate-500 hover:text-primary transition-colors hover:opacity-80">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

