import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Siren } from 'lucide-react';

const socket = io('http://127.0.0.1:5000');

export default function EmergencyHelp({ navigate }: { navigate: (page: string) => void }) {
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    socket.on('new_alert', () => {
      // This creates a more noticeable, non-blocking notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-5 right-5 bg-red-600 text-white py-3 px-5 rounded-lg shadow-lg animate-bounce';
      notification.innerText = '🚨 EMERGENCY ALERT TRIGGERED! 🚨';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 5000); // Notification disappears after 5 seconds
    });

    return () => {
      socket.off('new_alert');
    };
  }, []);

  const handleSosClick = async () => {
    if (confirm('Are you sure you want to send an SOS alert? This will notify all users.')) {
      try {
        await fetch('http://127.0.0.1:5000/api/emergency-alert', { method: 'POST' });
        setAlertSent(true);
      } catch (error) {
        console.error("Failed to send SOS alert:", error);
        alert("Failed to send alert. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
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
                onClick={handleSosClick} 
                className={`w-48 h-48 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl transition-all duration-300 ${alertSent ? 'cursor-not-allowed bg-red-400' : 'animate-pulse transform hover:scale-110'}`}
                disabled={alertSent}
            >
                SOS
            </button>
        </div>

        {alertSent && (
            <p className="text-lg font-semibold text-green-700 bg-green-100 py-3 px-5 rounded-lg">
                Emergency alert has been successfully sent to all users.
            </p>
        )}

        <div className="mt-12">
             <button onClick={() => navigate('home')} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all">
              Back to Home
            </button>
        </div>
    </div>
  );
}

