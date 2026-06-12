import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
    const [boards, setBoards] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#6366f1');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/boards').then(res => setBoards(res.data));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const res = await api.post('/boards', { name, description, color });
        setBoards([...boards, res.data]);
        setShowModal(false);
        setName('');
        setDescription('');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-white font-bold text-xl">ProjectFlow</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user?.name}</span>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">My Boards</h2>
                        <p className="text-gray-400 text-sm mt-1">Manage your projects</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                        + New Board
                    </button>
                </div>

                {/* Boards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boards.map(board => (
                        <div
                            key={board.id}
                            onClick={() => navigate(`/board/${board.id}`)}
                            className="bg-gray-900 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition border border-gray-800"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: board.color }}></div>
                                <h3 className="text-white font-semibold">{board.name}</h3>
                            </div>
                            {board.description && (
                                <p className="text-gray-400 text-sm">{board.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-3">{board.columns_count} columns</p>
                        </div>
                    ))}

                    {boards.length === 0 && (
                        <div className="col-span-3 text-center py-16">
                            <p className="text-gray-500">No boards yet. Create your first board!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white font-bold text-lg mb-4">Create New Board</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="My Project"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Color</label>
                                <div className="flex gap-2">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}