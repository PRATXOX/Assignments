import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.errors?.[0]?.message || 'Authentication failed');
      }

      // On successful auth, stash the JWT token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Route immediately to the dashboard
      navigate('/workspace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1015] p-4 text-gray-200">
      <div className="w-full max-w-xs space-y-8">
        <div className="space-y-1 text-left">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {isLogin ? 'Log in to FlowSync' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-400">
            {isLogin ? 'Enter your details below to continue.' : 'Sign up to start managing your workspace.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-800 rounded-sm p-2 text-sm focus:outline-none focus:border-gray-500 transition-colors bg-[#0E1015] text-gray-200 placeholder-gray-600"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-800 rounded-sm p-2 text-sm focus:outline-none focus:border-gray-500 transition-colors bg-[#0E1015] text-gray-200 placeholder-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black rounded-sm py-2 text-sm font-medium hover:bg-gray-200 transition-colors focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
          </button>
        </form>

        <div className="text-left mt-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
