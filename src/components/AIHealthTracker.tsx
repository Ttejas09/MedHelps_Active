import React, { useState } from 'react';

// Define the component's props to match your App.tsx structure
interface AIHealthTrackerProps {
  navigate: (page: string) => void;
  onSessionExpired: () => void;
}

// Your backend API URL
const API_URL = 'http://127.0.0.1:5000';

const AIHealthTracker: React.FC<AIHealthTrackerProps> = ({ navigate, onSessionExpired }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Retrieve the authentication token from localStorage
  const token = localStorage.getItem('jwtToken');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Your session has expired. Please log in again.');
      onSessionExpired(); // Call the logout function from App.tsx
      return;
    }

    setIsLoading(true);
    setResponse(''); // Clear previous response

    try {
      const res = await fetch(`${API_URL}/api/ai/health-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (res.status === 401 || res.status === 422) {
        // Handle expired or invalid token
        onSessionExpired();
        return;
      }

      if (!res.ok) {
        throw new Error('An error occurred while fetching the response.');
      }

      const data = await res.json();
      setResponse(data.response);

    } catch (error) {
      console.error(error);
      setResponse('Sorry, something went wrong. Please check the console or try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // The main container blends with your body's background color
    <div id="ai-assistant" className="min-h-screen w-full pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          {/* Apply the text-gradient class for a vibrant title */}
          <h1 className="text-5xl font-extrabold text-gradient bg-gradient-to-r from-primary to-accent">
            AI Health Assistant
          </h1>
          <p className="mt-4 text-lg text-charcoal">
            Get instant, AI-powered guidance for your health questions.
          </p>
        </div>

        {/* Main interactive card */}
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            <label htmlFor="health-query" className="block text-md font-semibold text-charcoal mb-2">
              Describe your symptoms or ask a question:
            </label>
            <textarea
              id="health-query"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
              rows={6}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'I have a persistent dry cough and a slight headache. What are some general precautions?'"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              // Use the gradient-primary class for the main button
              className="w-full mt-5 gradient-primary text-white py-3 px-6 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? 'Analyzing...' : 'Get AI Advice'}
            </button>
          </form>
        </div>

        {/* Response container, only shown when there is a response */}
        {response && (
          <div className="mt-10 bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold text-charcoal mb-4">AI Response:</h2>
            <div 
              className="text-charcoal leading-relaxed space-y-4" 
              // This is necessary to render the <br> tags from the API for new lines
              dangerouslySetInnerHTML={{ __html: response }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHealthTracker;

