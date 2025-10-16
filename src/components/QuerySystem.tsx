import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { CheckCircle, Trash2, Clock, Plus, ArrowLeft, X } from 'lucide-react';

// Define the structure of a Query object, including the new 'status' field
interface Query {
  id: number;
  user_name: string;
  bt_id: string;
  room_no: string;
  question_text: string;
  status: string;
  timestamp: string;
}

// The component now accepts 'navigate' and the auth 'token' as props from App.tsx
interface QuerySystemProps {
  navigate: (page: string) => void;
  token: string | null;
}

const socket: Socket = io('http://127.0.0.1:5000');

export default function QuerySystem({ navigate, token }: QuerySystemProps) {
  const [showModal, setShowModal] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [filter, setFilter] = useState('All');

  // State for the form inside the pop-up modal
  const [userName, setUserName] = useState('');
  const [btId, setBtId] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [message, setMessage] = useState('');

  // This function fetches the initial list of queries from the protected backend
  const fetchQueries = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/queries', {
        headers: {
          'Authorization': `Bearer ${token}` // Send the token to prove we are logged in
        }
      });
      if (!response.ok) throw new Error("Could not fetch queries");
      setQueries(await response.json());
    } catch (error) { console.error("Failed to fetch initial queries:", error); }
  };

  useEffect(() => {
    // Only fetch data if the user is logged in (has a token)
    if (token) {
        fetchQueries();
    }
    
    // Listen for real-time events
    socket.on('new_query', (newQuery: Query) => setQueries(prev => [newQuery, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
    socket.on('query_updated', (updatedQuery: Query) => setQueries(prev => prev.map(q => q.id === updatedQuery.id ? updatedQuery : q)));
    socket.on('query_deleted', (data: { id: number }) => setQueries(prev => prev.filter(q => q.id !== data.id)));

    // Clean up listeners
    return () => {
      socket.off('new_query');
      socket.off('query_updated');
      socket.off('query_deleted');
    };
  }, [token]); // Rerun this effect if the token changes

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await fetch('http://127.0.0.1:5000/api/queries', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Send token with the request
        },
        body: JSON.stringify({ user_name: userName, bt_id: btId, room_no: roomNo, question_text: questionText }),
      });
      // Clear form and close modal
      setUserName(''); setBtId(''); setRoomNo(''); setQuestionText(''); setMessage('');
      setShowModal(false);
    } catch (error) {
      setMessage('Failed to submit query. Please try again.');
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    socket.emit('update_query_status', { id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
        socket.emit('delete_query', { id });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredQueries = queries.filter(q => filter === 'All' || q.status === filter);

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
            {/* --- HEADER SECTION --- */}
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => navigate('home')} className="flex items-center text-sm text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
              <button onClick={() => setShowModal(true)} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-lg transform hover:scale-105">
                <Plus className="w-5 h-5 mr-2" />
                Submit Query
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Recent Queries</h1>
            </div>
            
            {/* --- FILTER TABS --- */}
            <div className="mb-6">
              <div className="flex space-x-2 border-b">
                {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => (
                  <button key={tab} onClick={() => setFilter(tab)} className={`py-2 px-4 text-sm font-medium transition-colors ${filter === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab} ({tab === 'All' ? queries.length : queries.filter(q => q.status === tab).length})
                  </button>
                ))}
              </div>
            </div>
            
            {/* --- LIVE QUERY FEED --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredQueries.length > 0 ? filteredQueries.map((query) => (
                <div key={query.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-transform hover:scale-[1.02]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{query.user_name}</p>
                      <p className="text-sm text-gray-500">#{query.bt_id} &bull; Room: {query.room_no}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(query.status)}`}>{query.status}</span>
                  </div>
                  <p className="my-4 text-gray-700 break-words">{query.question_text}</p>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => handleUpdateStatus(query.id, 'Resolved')} className="flex items-center text-green-600 hover:text-green-800 font-semibold"><CheckCircle className="w-4 h-4 mr-1"/> Resolve</button>
                      <button onClick={() => handleDelete(query.id)} className="flex items-center text-red-600 hover:text-red-800 font-semibold"><Trash2 className="w-4 h-4 mr-1"/> Delete</button>
                    </div>
                    <div className="flex items-center">
                       <Clock className="w-4 h-4 mr-1.5" />
                       {new Date(query.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : (
                   <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl shadow-md border">
                     <CheckCircle className="w-12 h-12 mx-auto text-gray-400" />
                     <h3 className="mt-4 text-lg font-semibold text-gray-700">All Clear!</h3>
                     <p className="mt-1 text-gray-500">There are no queries in this category.</p>
                   </div>
              )}
            </div>
        </div>
      </div>

      {/* --- SUBMIT QUERY MODAL (POP-UP) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md m-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6"/>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-charcoal">Raise a New Query</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" value={btId} onChange={(e) => setBtId(e.target.value)} placeholder="BT ID" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="Room No" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={4} placeholder="Describe your issue..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
              <div className="flex justify-end space-x-3 pt-4">
                   <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Submit</button>
              </div>
              {message && <p className="text-center text-sm text-red-500 mt-2">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

