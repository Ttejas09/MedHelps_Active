import { useState } from 'react';

// Define the component's props for TypeScript
interface LoginProps {
  onLoginSuccess: (token: string) => void;
  navigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, navigate }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      const data = await response.json();
      onLoginSuccess(data.access_token);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    }
  };
  
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
     try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 409) {
          throw new Error('Username already exists. Please choose another.');
      }
      if (!response.ok) {
        throw new Error('Registration failed. Please try again.');
      }
      // Automatically log in after successful registration
      handleLogin(event);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg border">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome to MedHelps
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in or create an account to continue
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </button>
            <button
              type="submit"
              onClick={handleRegister}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
