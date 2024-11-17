import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { validateEmail } from '../utils/validation';
import { getUserByEmail, createUser } from '../utils/db';
import { UserProfile } from '../types';

export const Auth = () => {
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const existingUser = await getUserByEmail(formData.email);
      if (!existingUser) {
        toast.error('No account found with this email');
        return;
      }

      // In a real app, you'd verify the password here
      setUser(existingUser);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const existingUser = await getUserByEmail(formData.email);
      if (existingUser) {
        toast.error('An account with this email already exists');
        return;
      }

      const newUser: UserProfile = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.username,
        gamesPlayed: 0,
        whiteWins: 0,
        blackWins: 0,
        draws: 0
      };
      
      await createUser(newUser);
      setUser(newUser);
      toast.success('Welcome to Chess Scorekeeper!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Sign up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Chess Scorekeeper
        </h1>
        <div className="flex justify-center mb-6">
          <div className="flex bg-amber-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-md transition-colors ${
                isLogin
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-amber-600 hover:bg-white/50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded-md transition-colors ${
                !isLogin
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-amber-600 hover:bg-white/50'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
              placeholder="Enter your email"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
                placeholder="Choose a username"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
              placeholder={isLogin ? "Enter your password" : "Create a password"}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};