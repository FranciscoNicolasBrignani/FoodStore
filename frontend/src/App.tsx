import './App.css';
import { NavBar } from './components/NavBar';
import { Hero } from './sections/Hero';
import { Catalogo } from './sections/Catalogo';

function App() {

  return (
    <div>
      <NavBar />
      <main>
        <Hero />
        <Catalogo />
      </main>
      <footer className="footer-class">
        © {new Date().getFullYear()} FoodStore - Francisco Nicolás Brignani
      </footer>
    </div>
  );
};

export default App
