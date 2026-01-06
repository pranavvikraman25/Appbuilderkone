import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Screen } from '../App';

const ALLOWED_EMAIL = 'kone123';
const ALLOWED_PASSWORD = 'kone123';

export function LoginScreen({ 
  onLogin,
  onNavigate 
}: { 
  onLogin: (email: string) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
      setError('Unauthorized access – company credentials required');
      return;
    }
    
    onLogin(email);
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
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-gray-900 mb-1">KONE Maintenance Access</h1>
            <p className="text-xs text-gray-500">Prototype access control</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@kone.com"
                className="w-full px-3 py-2 border border-gray-300 bg-white text-sm"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-[#005EB8] text-white px-4 py-3 hover:bg-[#004a94] transition-colors"
            >
              Login
            </button>
          </div>
          
          {/* Demo Credentials Note */}
          <div className="bg-gray-100 border border-gray-300 p-3 text-xs text-gray-600">
            <div className="mb-1">Demo credentials:</div>
            <div>Email: kone123</div>
            <div>Password: kone123</div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Only company-authorized email is allowed
          </div>
        </div>
      </div>
    </div>
  );
}
