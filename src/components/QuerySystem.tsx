import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
// NEW: Import MessageSquare and Send icons
import { CheckCircle, Trash2, Clock, Plus, ArrowLeft, X, MessageSquare, Send } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// --- NEW INTERFACE ---
interface Comment {
  id: number;
  text: string;
  timestamp: string;
  commenter_username: string;
  query_id: number;
}
// --- END NEW INTERFACE ---

// Define the structure of a Query object
interface Query {
  id: number;
  user_name: string;
  bt_id: string;
  room_no: string;
  question_text: string;
  status: string;
  timestamp: string;
  owner_username: string;
  comments: Comment[]; // MODIFIED: Add comments array
}

// Define the structure of the JWT payload
interface JwtPayload {
  sub: string; 
  iat: number;
  exp: number;
}

// Define the component's props for consistency
interface QuerySystemProps {
  navigate: (page: string) => void;
  onSessionExpired?: () => void;
}

const socket: Socket = io('http://127.0.0.1:5000');

const QuerySystem: React.FC<QuerySystemProps> = ({ navigate, onSessionExpired }) => {
  const [showModal, setShowModal] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // State for the form inside the pop-up modal
  const [btId, setBtId] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [message, setMessage] = useState('');

  // --- NEW: State for comment inputs and errors ---
  // We use an object to store the text for each query's comment box
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [commentErrors, setCommentErrors] = useState<{ [key: number]: string }>({});
  // --- END NEW ---

  const token = localStorage.getItem('jwtToken');

  let currentUserUsername: string | null = null;
  if (token) {
    try {
      const decodedToken: JwtPayload = jwtDecode(token);
      currentUserUsername = decodedToken.sub;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  useEffect(() => {
    const fetchQueries = async () => {
      if (!token || !currentUserUsername) {
        onSessionExpired?.();
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:5000/api/queries', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
          onSessionExpired?.();
          return;
        }
        if (!response.ok) throw new Error("Could not fetch queries");
        // The response JSON will now include the 'comments' array for each query
        setQueries(await response.json());
      } catch (error) {
        console.error("Failed to fetch initial queries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueries();

    // Set up real-time event listeners
    socket.on('new_query', (newQuery: Query) => {
      setQueries(prev => [newQuery, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
    socket.on('query_updated', (updatedQuery: Query) => {
      setQueries(prev => prev.map(q => q.id === updatedQuery.id ? updatedQuery : q));
    });
    socket.on('query_deleted', (data: { id: number }) => {
      setQueries(prev => prev.filter(q => q.id !== data.id));
    });
    
    // --- NEW: Socket listener for new comments ---
    socket.on('new_comment', (newComment: Comment) => {
      setQueries(prevQueries =>
        prevQueries.map(q => {
          // Find the query this comment belongs to
          if (q.id === newComment.query_id) {
            // Return a new query object with the new comment added
            return {
              ...q,
              comments: [...q.comments, newComment]
            };
          }
          return q; // Not this query, return as-is
        })
      );
    });
    // --- END NEW ---

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('new_query');
      socket.off('query_updated');
      socket.off('query_deleted');
      socket.off('new_comment'); // NEW: Cleanup comment listener
    };
  }, [token, onSessionExpired, currentUserUsername]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!btId.trim() || !roomNo.trim() || !questionText.trim()) {
      setMessage("All fields are required.");
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bt_id: btId, room_no: roomNo, question_text: questionText }),
      });
      if (!response.ok) {
        throw new Error("Server responded with an error");
      }
      setBtId(''); setRoomNo(''); setQuestionText('');
      setShowModal(false);
    } catch (error) {
      setMessage('Failed to submit query. Please try again.');
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    socket.emit('update_query_status', { id, status, token });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      socket.emit('delete_query', { id, token });
    }
  };

  // --- NEW: Handlers for comment input and submission ---
  const handleCommentChange = (queryId: number, text: string) => {
    setCommentInputs(prev => ({ ...prev, [queryId]: text }));
    // Clear error on type
    if (commentErrors[queryId]) {
      setCommentErrors(prev => ({ ...prev, [queryId]: '' }));
    }
  };

  const handleCommentSubmit = async (queryId: number) => {
    const text = commentInputs[queryId];
    if (!text || !text.trim()) {
      setCommentErrors(prev => ({ ...prev, [queryId]: 'Comment cannot be empty.' }));
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/queries/${queryId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (response.status === 401) {
        onSessionExpired?.();
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      // Success! Clear the input field.
      // The socket.io 'new_comment' listener will handle updating the UI.
      setCommentInputs(prev => ({ ...prev, [queryId]: '' }));

    } catch (error) {
      console.error("Failed to submit comment:", error);
      setCommentErrors(prev => ({ ...prev, [queryId]: 'Failed to send. Try again.' }));
    }
  };
  // --- END NEW HANDLERS ---

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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('home')} className="flex items-center text-sm text-gray-600 hover:text-blue-600 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Submit Query
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Recent Queries</h1>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 border-b">
              {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => (
                <button key={tab} onClick={() => setFilter(tab)} className={`py-2 px-4 text-sm font-medium ${filter === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab} ({tab === 'All' ? queries.length : queries.filter(q => q.status === tab).length})
                </button>
              ))}
            </div>
          </div>

          {/* Live Query Feed */}
          {isLoading ? <p className="text-center text-gray-500">Loading queries...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQueries.length > 0 ? filteredQueries.map((query) => (
                <div key={query.id} className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{query.owner_username}</p>
                      <p className="text-sm text-gray-500">#{query.bt_id} &bull; Room: {query.room_no}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusBadge(query.status)}`}>{query.status}</span>
                  </div>
                  <p className="my-4 text-gray-700 break-words">{query.question_text}</p>
                  
                  {/* --- NEW: Comments Section --- */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comments ({query.comments.length})
                    </h4>
                    {/* Comment List */}
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 mb-3">
                      {query.comments.length > 0 ? query.comments.map(comment => (
                        <div key={comment.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700 break-words">{comment.text}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            <strong>{comment.commenter_username}</strong>
                            <span className="float-right">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-400 italic">No comments yet.</p>
                      )}
                    </div>
                    {/* New Comment Form */}
                    <form className="flex space-x-2" onSubmit={(e) => {
                      e.preventDefault();
                      handleCommentSubmit(query.id);
                    }}>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={commentInputs[query.id] || ''}
                        onChange={(e) => handleCommentChange(query.id, e.target.value)}
                      />
                      <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                    {commentErrors[query.id] && (
                      <p className="text-xs text-red-500 mt-1">{commentErrors[query.id]}</p>
                    )}
                  </div>
                  {/* --- END NEW Comments Section --- */}

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                    {currentUserUsername === query.owner_username ? (
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleUpdateStatus(query.id, 'Resolved')}
                          className="flex items-center text-green-600 hover:text-green-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={query.status === 'Resolved'}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                        </button>
                        <button
                          onClick={() => handleDelete(query.id)}
                          className="flex items-center text-red-600 hover:text-red-800 font-semibold">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {new Date(query.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-2xl shadow-md border">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-700">All Clear!</h3>
                  <p className="mt-1 text-gray-500">There are no queries in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Query Modal (No changes needed) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Raise a New Query</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={btId} onChange={(e) => setBtId(e.target.value)} placeholder="BT ID" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="Room No" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={4} placeholder="Describe your issue..." className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
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
};

export default QuerySystem;