import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SessionsEnhanced from './pages/SessionsEnhanced';
import DigitalEmployees from './pages/DigitalEmployees';
import DigitalEmployeeDetail from './pages/DigitalEmployeeDetailRefactored';
import ABTestingEnhanced from './pages/ABTestingEnhanced';
import Analytics from './pages/Analytics';
import ToolManagement from './pages/ToolManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公开路由 - 登录页面 */}
          <Route path="/login" element={<Login />} />

          {/* 私有路由 - 需要认证 */}
          <Route path="/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sessions" element={<SessionsEnhanced />} />
                  <Route path="/digital-employees" element={<DigitalEmployees />} />
                  <Route path="/digital-employees/:id" element={<DigitalEmployeeDetail />} />
                  <Route path="/ab-testing" element={<ABTestingEnhanced />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/tools" element={<ToolManagement />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;