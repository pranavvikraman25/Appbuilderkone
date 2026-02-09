import { useState } from 'react';
import { Eye, EyeOff, UserCircle } from 'lucide-react';
import { Screen } from '../App';
import * as api from '../utils/api';

export function LoginScreen({ 
  onLogin,
  onNavigate 
}: { 
  onLogin: (email: string, name: string, role: 'admin' | 'maintainer', accessToken: string) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'maintainer'>('maintainer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.login(email, password);
      
      if (response.success && response.user) {
        onLogin(response.user.email, response.user.name, response.user.role, response.accessToken);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.signup(email, password, name, role);
      
      if (response.success) {
        // Auto-login after signup
        const loginResponse = await api.login(email, password);
        if (loginResponse.success && loginResponse.user) {
          onLogin(loginResponse.user.email, loginResponse.user.name, loginResponse.user.role, loginResponse.accessToken);
        }
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignupMode) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex gap-1">
          {['K', 'O', 'N', 'E'].map((letter) => (
            <div
              key={letter}
              className="w-6 h-8 border border-[#005EB8] flex items-center justify-center text-[#005EB8] text-xs"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-gray-900 mb-1">KONE Maintenance Tracker</h1>
            <p className="text-xs text-gray-500">
              {isSignupMode ? 'Create your account' : 'Login to continue'}
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          {/* Form */}
          <div className="space-y-4">
            {isSignupMode && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
                  disabled={loading}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@kone.com"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-sm pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isSignupMode && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="maintainer"
                      checked={role === 'maintainer'}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'maintainer')}
                      className="w-4 h-4"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Maintainer (Technician)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'maintainer')}
                      className="w-4 h-4"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Admin (Supervisor)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maintainers: Start/End maintenance | Admins: Full access including heat maps
                </p>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#005EB8] text-white px-4 py-3 hover:bg-[#004a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignupMode ? 'Create Account' : 'Login')}
            </button>

            <button
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setError('');
              }}
              disabled={loading}
              className="w-full text-[#005EB8] text-sm hover:underline"
            >
              {isSignupMode ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-300 p-3 text-xs text-gray-700">
            <div className="font-medium mb-2 flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Role Differences:
            </div>
            <div className="space-y-1">
              <div><span className="font-medium">Maintainer:</span> Can start/end maintenance and view final report</div>
              <div><span className="font-medium">Admin:</span> Full access including heat maps and all sessions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
