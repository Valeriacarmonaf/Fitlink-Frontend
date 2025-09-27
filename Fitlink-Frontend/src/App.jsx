
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

export default function App() {
  return (
    <>
      <Header />

      {/* Landing vacío por ahora */}
      <main className="fl-main">
        <section className="fl-hero">
          <h1>Bienvenido a FitLink</h1>
          <p>
            Conecta con personas para entrenar, correr o jugar en equipo.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}