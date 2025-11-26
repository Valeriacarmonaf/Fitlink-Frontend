import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-10 bg-[#6BA8FF] text-white">
      <div className="flex justify-center gap-4 py-4 md:gap-5 md:py-5">
        <span className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px">
          <Facebook className="w-full h-full" />
        </span>
        <span className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px">
          <Twitter className="w-full h-full" />
        </span>
        <span className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px">
          <Instagram className="w-full h-full" />
        </span>
        <span className="inline-flex w-8 h-8 opacity-95 transition duration-200 hover:opacity-100 hover:-translate-y-px">
          <Linkedin className="w-full h-full" />
        </span>
      </div>

      <div className="flex justify-center py-2 pb-4">
        <p className="font-extrabold tracking-wider text-sm">
          &copy; {new Date().getFullYear()} FitLink
        </p>
      </div>
    </footer>
  );
}