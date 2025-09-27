import "./header.css";

export default function Header() {
  return (
    <header className="fl-header">
      <div className="fl-container">
        <div className="fl-brand">FitLink</div>

        <form className="fl-search" role="search" aria-label="Buscar">
          <input
            type="search"
            placeholder="Buscar actividades…"
            aria-label="Buscar actividades"
          />
        </form>

        <a className="fl-cta" href="#" aria-label="Registrarme">
          Registrarme
        </a>
      </div>
    </header>
  );
}
