import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// Tailwind conversion notes:
// --fitlink-blue: #6BA8FF -> bg-[#6BA8FF]
// --fitlink-white: #ffffff -> text-white

export default function Footer() {
  return (
    // fl-footer: margin-top: 40px, background: var(--fitlink-blue), color: var(--fitlink-white)
    <footer className="mt-10 bg-[#6BA8FF] text-white">
      
      {/* fl-footer-top: fle justify-content: center gap: 18px/22px padding: 16px 0 8px/10px */}
      <div className="flex justify-center gap-4 py-4 md:gap-5 md:py-5">
        
        {/* fl-social: inline-flex w/h: 32px opacity: 0.95, hover: opacity: 1, transform: translateY(-1px) */}
        <a 
          href="#" 
          aria-label="Facebook" 
          className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px"
        >
          <Facebook className="w-full h-full" />
        </a>
        <a 
          href="#" 
          aria-label="Twitter" 
          className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px"
        >
          <Twitter className="w-full h-full" />
        </a>
        <a 
          href="#" 
          aria-label="Instagram" 
          className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px"
        >
          <Instagram className="w-full h-full" />
        </a>
        <a 
          href="#" 
          aria-label="LinkedIn" 
          className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px"
        >
          <Linkedin className="w-full h-full" />
        </a>
      </div>

      {/* fl-footer-bottom: flex justify-content: center padding: 6px 0 14px */}
      <div className="flex justify-center py-2 pb-4">
        {/* fl-footer-brand: font-weight: 800 letter-spacing: 0.3px */}
        <p className="font-extrabold tracking-wider text-sm">
          &copy; {new Date().getFullYear()} FitLink
        </p>
      </div>
    </footer>
  );
}
