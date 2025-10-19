import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Siren } from 'lucide-react'; // Make sure you have installed lucide-react (`npm install lucide-react`)

// --- INTERFACES AND CONSTANTS ---
interface Alert {
    id: number;
    emergency_type: string;
    location: string | null;
    timestamp: string;
    owner_username: string;
}

interface EmergencyHelpProps {
  onSessionExpired: () => void;
  // We don't need navigate here anymore, but keeping the pattern is good
  navigate: (page: string) => void; 
}

const API_URL = 'http://127.0.0.1:5000';

// --- COMPONENT ---
const EmergencyHelp: React.FC<EmergencyHelpProps> = ({ onSessionExpired, navigate }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alertSent, setAlertSent] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const token = localStorage.getItem('jwtToken');
    
    // --- EFFECTS ---
    useEffect(() => {
        // Function to fetch initial alerts from the server
        const fetchAlerts = async () => {
            if (!token) { onSessionExpired(); return; }
            try {
                const res = await fetch(`${API_URL}/api/alerts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 401) { onSessionExpired(); return; }
                const data = await res.json();
                setAlerts(data);
            } catch (err) {
                console.error('Failed to fetch alerts.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlerts();

        // Connect to Socket.IO for real-time alert notifications
        const socket: Socket = io(API_URL);
        socket.on('new_alert', (newAlert: Alert) => {
            // Add the new alert to the top of the list
            setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
            
            // Show a temporary notification toast
            const notification = document.createElement('div');
            notification.className = 'fixed top-5 right-5 bg-red-600 text-white py-3 px-5 rounded-lg shadow-lg animate-bounce z-50';
            notification.innerText = '🚨 NEW EMERGENCY ALERT RECEIVED! 🚨';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    // --- HANDLERS ---
    const handleSendAlert = async () => {
        setShowConfirmModal(false); // Close the confirmation modal first
        if (!token) { onSessionExpired(); return; }

        const alertData = {
            emergency_type: 'Medical Assistance Requested',
            location: 'User location (to be implemented)'
        };

        try {
            const res = await fetch(`${API_URL}/api/alerts`, { // CORRECTED ENDPOINT
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ADDED AUTH
                },
                body: JSON.stringify(alertData)
            });

            if (!res.ok) throw new Error("Server rejected the alert.");
            
            setAlertSent(true); // Disable button after successful send
        } catch (err) {
            console.error("Failed to send SOS alert:", err);
            alert("Failed to send alert. Please try again.");
        }
    };

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4 pt-28 pb-12">
            
            {/* Main SOS Section */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center">
                        <Siren className="w-10 h-10 text-red-600" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Instant Emergency Help</h1>
                <p className="mt-4 text-xl text-gray-600">
                    Press the button below only in a genuine emergency. An alert will be sent to all active users.
                </p>
            </div>
            
            <div className="my-12">
                <button 
                    onClick={() => setShowConfirmModal(true)}
                    className={`w-48 h-48 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl transition-all duration-300 ${alertSent ? 'cursor-not-allowed bg-red-400' : 'animate-pulse transform hover:scale-110'}`}
                    disabled={alertSent}
                >
                    SOS
                </button>
            </div>

            {alertSent && (
                <p className="text-lg font-semibold text-green-700 bg-green-100 py-3 px-5 rounded-lg shadow-sm">
                    Emergency alert has been successfully sent.
                </p>
            )}

            {/* Recent Alerts Feed */}
            <div className="w-full max-w-2xl mx-auto mt-16 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Alerts Feed</h2>
                {isLoading ? <p>Loading alerts...</p> : alerts.length === 0 ? (
                    <p className="text-gray-500">No recent alerts.</p>
                ) : (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                        {alerts.map(alert => (
                            <div key={alert.id} className="p-3 border rounded-lg bg-red-50 border-red-200">
                                <p className="font-bold text-red-800">{alert.emergency_type}</p>
                                <p className="text-sm text-gray-600">Sent by: <strong>{alert.owner_username}</strong> at {new Date(alert.timestamp).toLocaleTimeString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm">
                        <h2 className="text-2xl font-bold mb-4">Confirm Emergency Alert</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to send this alert? This action cannot be undone and will notify all users immediately.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowConfirmModal(false)} className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-semibold hover:bg-gray-400">Cancel</button>
                            <button onClick={handleSendAlert} className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700">Yes, Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyHelp;

