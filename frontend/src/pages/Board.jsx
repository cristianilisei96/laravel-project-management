import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Board() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [columnName, setColumnName] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');

    useEffect(() => {
        api.get(`/boards/${id}`).then(res => setBoard(res.data));
    }, [id]);

    const handleAddColumn = async (e) => {
        e.preventDefault();
        const res = await api.post(`/boards/${id}/columns`, { name: columnName });
        setBoard({ ...board, columns: [...board.columns, { ...res.data, tasks: [] }] });
        setColumnName('');
        setShowColumnModal(false);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        const res = await api.post('/tasks', {
            column_id: activeColumn,
            title: taskTitle,
            description: taskDescription,
            deadline: taskDeadline || null,
            priority: taskPriority,
        });
        setBoard({
            ...board,
            columns: board.columns.map(col =>
                col.id === activeColumn
                    ? { ...col, tasks: [...col.tasks, res.data] }
                    : col
            )
        });
        setTaskTitle('');
        setTaskDescription('');
        setTaskDeadline('');
        setTaskPriority('medium');
        setShowTaskModal(false);
    };

    const priorityColors = {
        low: 'bg-green-500/20 text-green-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-red-500/20 text-red-400',
    };

    if (!board) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition">
                        ← Back
                    </button>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: board.color }}></div>
                    <h1 className="text-white font-bold text-xl">{board.name}</h1>
                </div>
                <button
                    onClick={() => setShowColumnModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                    + Add Column
                </button>
            </nav>

            {/* Columns */}
            <div className="flex gap-4 p-6 overflow-x-auto min-h-[calc(100vh-65px)]">
                {board.columns.map(column => (
                    <div key={column.id} className="bg-gray-900 rounded-xl p-4 w-72 flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-semibold">{column.name}</h3>
                            <span className="text-gray-500 text-xs">{column.tasks.length}</span>
                        </div>

                        {/* Tasks */}
                        <div className="space-y-2 mb-3">
                            {column.tasks.map(task => (
                                <div key={task.id} className="bg-gray-800 rounded-lg p-3">
                                    <p className="text-white text-sm font-medium">{task.title}</p>
                                    {task.description && (
                                        <p className="text-gray-400 text-xs mt-1">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                        {task.deadline && (
                                            <span className="text-gray-500 text-xs">📅 {task.deadline}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => { setActiveColumn(column.id); setShowTaskModal(true); }}
                            className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 hover:bg-gray-800 rounded-lg transition"
                        >
                            + Add Task
                        </button>
                    </div>
                ))}

                {board.columns.length === 0 && (
                    <div className="flex items-center justify-center w-full">
                        <p className="text-gray-500">No columns yet. Add your first column!</p>
                    </div>
                )}
            </div>

            {/* Column Modal */}
            {showColumnModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white font-bold text-lg mb-4">Add Column</h3>
                        <form onSubmit={handleAddColumn} className="space-y-4">
                            <input
                                type="text"
                                value={columnName}
                                onChange={e => setColumnName(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Column name (e.g. To Do)"
                                required
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowColumnModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white font-bold text-lg mb-4">Add Task</h3>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Task title"
                                required
                            />
                            <textarea
                                value={taskDescription}
                                onChange={e => setTaskDescription(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Description (optional)"
                                rows={3}
                            />
                            <input
                                type="date"
                                value={taskDeadline}
                                onChange={e => setTaskDeadline(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={taskPriority}
                                onChange={e => setTaskPriority(e.target.value)}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowTaskModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition">
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}