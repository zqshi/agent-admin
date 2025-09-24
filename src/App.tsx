import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SessionsEnhanced from './pages/SessionsEnhanced';
import DigitalEmployees from './pages/DigitalEmployees';
import DigitalEmployeeDetail from './pages/DigitalEmployeeDetailRefactored';
import ABTestingEnhanced from './pages/ABTestingEnhanced';
import Analytics from './pages/Analytics';
import ToolManagement from './pages/ToolManagement';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<SessionsEnhanced />} />
          <Route path="/digital-employees" element={<DigitalEmployees />} />
          <Route path="/digital-employees/:id" element={<DigitalEmployeeDetail />} />
          <Route path="/ab-testing" element={<ABTestingEnhanced />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tools" element={<ToolManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;