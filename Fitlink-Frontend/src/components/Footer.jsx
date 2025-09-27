
import "./footer.css";

export default function Footer() {
  return (
    <footer className="fl-footer">
      <div className="fl-footer-top">
        <a
          className="fl-social"
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Instagram"
        >
          {/* Instagram (blanco) */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2A2.8 2.8 0 1 0 12 16.8 2.8 2.8 0 0 0 12 9.2zm5.2-1.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"
              fill="currentColor"
            />
          </svg>
        </a>

        <a
          className="fl-social"
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          title="X (Twitter)"
        >
          {/* X (blanco) */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 3h3.6l5.1 7.2L15.9 3H21l-7.1 9.9L21 21h-3.6l-5.4-7.6L8.1 21H3l7.5-10.5L3 3z"
              fill="currentColor"
            />
          </svg>
        </a>

        <a
          className="fl-social"
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
        >
          {/* Facebook (blanco) */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M13.5 21v-7.5h2.5l.4-3H13.5V8.3c0-.9.3-1.5 1.6-1.5h1.3V4.1c-.6-.1-1.4-.1-2.3-.1-2.3 0-3.8 1.3-3.8 3.9V10.5H8v3h2.3V21h3.2z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>

      <div className="fl-footer-bottom">
        <span className="fl-footer-brand">FitLink</span>
      </div>
    </footer>
  );
}
