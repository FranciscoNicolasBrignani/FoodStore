import './App.css';
import { NavBar } from './components/Navbar';
import { Home } from './pages/client/home';

function App() {

  return (
    <div>
      <NavBar />
      <main>
        <Home />
      </main>
      <footer className="footer-class">
        © {new Date().getFullYear()} FoodStore - Francisco Nicolás Brignani
      </footer>
    </div>
  );
};

export default App
