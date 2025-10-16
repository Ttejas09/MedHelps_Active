import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Pill, Calendar, Plus, X } from 'lucide-react';

interface Medicine {
  id: number;
  name: string;
  expiry_date: string;
  timestamp: string;
}

const socket = io('http://127.0.0.1:5000');

export default function MedicineAlerts({ navigate }: { navigate: (page: string) => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [medName, setMedName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/medicines');
        setMedicines(await response.json());
      } catch (error) {
        console.error("Failed to fetch medicines:", error);
      }
    };
    fetchMedicines();

    socket.on('new_medicine', (newMedicine: Medicine) => {
      setMedicines(prevMeds => [newMedicine, ...prevMeds]);
    });

    return () => {
      socket.off('new_medicine');
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!medName.trim() || !expiryDate.trim()) {
      setMessage('Please fill out all fields.');
      return;
    }
    try {
      await fetch('http://127.0.0.1:5000/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: medName, expiry_date: expiryDate }),
      });
      setMedName('');
      setExpiryDate('');
      setMessage('');
      setShowModal(false); // Close modal on success
    } catch (error) {
      setMessage('Failed to add medicine.');
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Medicine Alerts</h1>
              <p className="mt-2 text-xl text-gray-600">Track medicine inventory and expiry dates.</p>
            </div>
             <button onClick={() => setShowModal(true)} className="flex items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-all shadow-lg">
                <Plus className="w-5 h-5 mr-2" /> Add Medicine
            </button>
          </div>

          {/* Display Section */}
          <div className="space-y-4">
            {medicines.length > 0 ? medicines.map(med => (
                <div key={med.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <Pill className="w-6 h-6 text-purple-600"/>
                        </div>
                        <div>
                           <p className="font-bold text-lg text-gray-800">{med.name}</p>
                           <p className="text-sm text-gray-500">Added: {new Date(med.timestamp).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center bg-red-100 text-red-800 p-2 rounded-lg">
                       <Calendar className="w-5 h-5 mr-2"/>
                       <span className="font-semibold text-sm">Expires: {med.expiry_date}</span>
                    </div>
                </div>
            )) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md border">
                <Pill className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">No Medicines Added Yet</h3>
                <p className="mt-1 text-gray-500">Click "Add Medicine" to get started.</p>
              </div>
            )}
          </div>
          <div className="text-center mt-12">
              <button onClick={() => navigate('home')} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all">
                Back to Home
              </button>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md m-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-charcoal">Add New Medicine</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Medicine Name</label>
                    <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g., Paracetamol" className="mt-1 w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
              <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Add Medicine</button>
              </div>
              {message && <p className="text-center text-sm text-red-500 mt-2">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

