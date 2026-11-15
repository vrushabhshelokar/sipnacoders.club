import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './site/Layout';
import Home from './pages/Home';
import Event from './pages/Event';
import Upcoming from './pages/Upcoming';
import Team from './pages/Team';
import Connect from './pages/Connect';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/events" element={<Event />} />
          <Route path="/team" element={<Team />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/visitor-analytics" element={<AdminAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
