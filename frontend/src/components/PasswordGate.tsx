import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BetaRequestForm } from './BetaRequestForm';

const STORAGE_KEY = 'ideahub_beta_access';

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const correctPassword = import.meta.env.VITE_BETA_PASSWORD || 'IdeaHubBeta2025';

  useEffect(() => {
    // Check if user has already authenticated
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === correctPassword) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [correctPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === correctPassword) {
      localStorage.setItem(STORAGE_KEY, password);
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Show loading state briefly while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show password gate
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            IdeaHub
          </CardTitle>
          <CardDescription className="text-base">
            Closed Beta Access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Beta Access Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter beta password"
                className={error ? 'border-red-500' : ''}
                autoFocus
                required
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Access Beta
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                This is a closed beta. You need an access password to continue.
              </p>
              <p className="text-xs text-gray-500">
                Don't have access? <BetaRequestForm />
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
