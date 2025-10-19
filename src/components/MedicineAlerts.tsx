import React, { useState, useEffect } from 'react';

// --- INTERFACES AND CONSTANTS ---
interface Medicine {
  id: number;
  medicine_name: string;
  expiry_date: string;
}

interface MedicineAlertsProps {
  onSessionExpired?: () => void; // Prop is now optional
}

const API_URL = 'http://127.0.0.1:5000';

// --- COMPONENT ---
const MedicineAlerts: React.FC<MedicineAlertsProps> = ({ onSessionExpired }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('jwtToken');

  // --- DATA FETCHING ---
  const fetchMedicines = async () => {
    // Use optional chaining to safely call the function
    if (!token) { onSessionExpired?.(); return; } 
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Use optional chaining here as well
      if (res.status === 401) { onSessionExpired?.(); return; }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMedicines(data);
    } catch (err) { 
      console.error(err);
      setError('Failed to fetch medicines.');
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // --- HANDLERS ---
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newMedicineName || !newExpiryDate) {
      setError('Both fields are required.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ medicineName: newMedicineName, expiryDate: newExpiryDate }), // Correct field names
      });
      if (!res.ok) throw new Error('Server rejected request');
      
      setShowModal(false);
      setNewMedicineName('');
      setNewExpiryDate('');
      fetchMedicines(); // Refresh the list
    } catch (err) {
      setError('Failed to add medicine. Please try again.');
    }
  };
  
  const handleDeleteMedicine = async (medicineId: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
        const res = await fetch(`${API_URL}/api/medicines/${medicineId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchMedicines(); // Refresh the list
    } catch (err) {
        alert('Failed to delete medicine.');
    }
  };

  // --- HELPERS ---
  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Expired', color: 'bg-red-500 text-white' };
    if (diffDays <= 30) return { text: `Expires in ${diffDays} days`, color: 'bg-yellow-400 text-gray-800' };
    return { text: `Expires on ${new Date(expiryDate).toLocaleDateString()}`, color: 'bg-green-500 text-white' };
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Medicine Alerts</h1>
          <button onClick={() => setShowModal(true)} className="gradient-primary text-white py-2 px-5 rounded-lg font-semibold hover:opacity-90 transition-transform hover:scale-105">
            + Add Medicine
          </button>
        </div>

        {isLoading ? <p>Loading medicines...</p> : medicines.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow"><p className="text-gray-500">You haven't added any medicines yet.</p></div>
        ) : (
          <div className="space-y-4">
            {medicines.map((med) => {
                const status = getExpiryStatus(med.expiry_date);
                return (
                    <div key={med.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                        <span className="font-semibold text-lg text-gray-700">{med.medicine_name}</span>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>{status.text}</span>
                            <button onClick={() => handleDeleteMedicine(med.id)} className="text-xl text-red-500 hover:text-red-700 font-bold">&times;</button>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Medicine</h2>
              <button onClick={() => {setShowModal(false); setError('');}} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleAddMedicine}>
              <div className="mb-4">
                <label htmlFor="medicineName" className="block text-sm font-medium text-gray-700">Medicine Name</label>
                <input type="text" id="medicineName" value={newMedicineName} onChange={(e) => setNewMedicineName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
              </div>
              <div className="mb-4">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="date" id="expiryDate" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => {setShowModal(false); setError('');}} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="gradient-primary text-white py-2 px-4 rounded-lg hover:opacity-90">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineAlerts;

