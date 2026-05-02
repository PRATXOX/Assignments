import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import WorkspaceBoard from './components/WorkspaceBoard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0E1015] text-gray-200 font-sans selection:bg-gray-800">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/workspace" element={<WorkspaceBoard />} />
          {/* Redirect any unknown routes to auth */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
