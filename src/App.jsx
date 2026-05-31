import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Event from "./pages/Event"
import Team from './pages/Team';
import Connect from './pages/Connect';
import RegistrationForm from './components/RegistrationForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/events" element={<Event />} />
          <Route path="/team" element={<Team />} />
          <Route path="/connect" element={<Connect />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
