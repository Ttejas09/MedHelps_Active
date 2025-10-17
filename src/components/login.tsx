import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PROPS INTERFACE ---
// To ensure this component integrates with your app, we define its props.
interface AnimatedLoginProps {
  onLoginSuccess: (token: string) => void;
  // The navigate prop is included to match your old component's structure.
  navigate: (page: string) => void; 
}

// Simple user icon component
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

// Blue heart icon component
const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);


export default function AnimatedLoginPage({ onLoginSuccess, navigate }: AnimatedLoginProps) {
    // State to manage if the card is expanded (hovered)
    const [isExpanded, setIsExpanded] = useState(false);
    // State to toggle between Login and Sign Up forms
    const [isLogin, setIsLogin] = useState(true); // Default to login form

    // State for form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    // --- Gemini API State ---
    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    // --- LOGIN LOGIC (from old login.tsx) ---
    const handleLogin = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();
        setMessage('');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                // Changed data.message to data.msg to match Flask backend
                throw new Error(data.msg || 'Login failed. Please check your credentials.');
            }
            // On success, pass the token up to the parent component (App.tsx)
            onLoginSuccess(data.access_token);
        } catch (err: any) {
            setMessage(err.message || 'An error occurred during login.');
        }
    };

    // --- REGISTER LOGIC (from old login.tsx) ---
    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.status === 409) {
                // Changed data.message to data.msg to match Flask backend
                throw new Error(data.msg || 'Username already exists.');
            }
            if (!response.ok) {
                 // Changed data.message to data.msg to match Flask backend
                throw new Error(data.msg || 'Registration failed. Please try again.');
            }
            // Automatically log in after successful registration
            await handleLogin();
        } catch (err: any) {
            setMessage(err.message || 'An error occurred during registration.');
        }
    };
    
    // --- Gemini API Call for Username Suggestions ---
    const handleSuggestUsername = async () => {
        setIsSuggesting(true);
        setSuggestionError('');
        setUsernameSuggestions([]);

        const apiKey = ""; // API key is handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: "Suggest 3 creative, secure, and unique usernames. Avoid common names. Examples: 'StellarQuest7', 'PixelPirate', 'EchoRider'." }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: { "suggestions": { type: "ARRAY", items: { "type": "STRING" } } },
                }
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                const parsedJson = JSON.parse(jsonText);
                setUsernameSuggestions(parsedJson.suggestions || []);
            } else {
                throw new Error("No suggestions found in the response.");
            }
        } catch (error) {
            console.error('Error fetching username suggestions:', error);
            setSuggestionError('Could not get suggestions. Please try again.');
        } finally {
            setIsSuggesting(false);
        }
    };


    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
            <motion.div
                layout
                className={`p-8 rounded-2xl shadow-lg cursor-pointer transition-colors duration-500 ${isExpanded ? 'bg-white' : 'bg-white'}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                style={{
                    width: isExpanded ? '400px' : '200px',
                    height: isExpanded ? 'auto' : '150px',
                    minHeight: '150px',
                    overflow: 'hidden'
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.3 } }}
                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                            className="flex flex-col items-center justify-center h-full"
                        >
                            <UserIcon />
                            <h2 className="text-xl font-semibold text-gray-700 mt-2">Login</h2>
                            <p className="text-xs text-gray-400">Hover to continue</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        >
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login-form"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="flex items-center justify-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-800">Login</h2>
                                            <HeartIcon />
                                        </div>
                                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                            <input
                                                type="text"
                                                placeholder="Enter your username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                                Login
                                            </button>
                                        </form>
                                        <button onClick={() => setIsLogin(false)} className="text-xs text-blue-500 hover:underline mt-4 text-center w-full">
                                            Don't have an account?
                                        </button>

                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup-form"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="flex items-center justify-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-800">Sign up</h2>
                                            <HeartIcon />
                                        </div>
                                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter your username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    />
                                                    <button type="button" onClick={handleSuggestUsername} disabled={isSuggesting} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm">
                                                        ✨ Suggest
                                                    </button>
                                                </div>
                                                 {isSuggesting && <p className="text-xs text-gray-500 mt-2 text-center">Getting suggestions...</p>}
                                                 {suggestionError && <p className="text-xs text-red-500 mt-2 text-center">{suggestionError}</p>}
                                                 {usernameSuggestions.length > 0 && (
                                                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                                                        {usernameSuggestions.map((suggestion) => (
                                                            <button key={suggestion} type="button" onClick={() => setUsername(suggestion)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                 )}
                                            </div>

                                            <input
                                                type="password"
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                                Create Account
                                            </button>
                                        </form>
                                        <button onClick={() => setIsLogin(true)} className="text-xs text-blue-500 hover:underline mt-4 text-center w-full">
                                            Already have an account?
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {message && <p className="text-sm text-red-500 mt-4 text-center">{message}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
