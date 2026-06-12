import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import api from '../services/api';
import DroppableColumn from '../components/DroppableColumn';

const priorityColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
};

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

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColId = Number(source.droppableId);
        const destColId = Number(destination.droppableId);
        const taskId = Number(draggableId);

        const sourceCol = board.columns.find(c => c.id === sourceColId);
        const destCol = board.columns.find(c => c.id === destColId);
        const task = sourceCol.tasks.find(t => t.id === taskId);

        // Update UI optimistically
        const newColumns = board.columns.map(col => {
            if (col.id === sourceColId && col.id === destColId) {
                const newTasks = [...col.tasks];
                newTasks.splice(source.index, 1);
                newTasks.splice(destination.index, 0, task);
                return { ...col, tasks: newTasks };
            }
            if (col.id === sourceColId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            if (col.id === destColId) {
                const newTasks = [...col.tasks];
                newTasks.splice(destination.index, 0, { ...task, column_id: destColId });
                return { ...col, tasks: newTasks };
            }
            return col;
        });

        setBoard({ ...board, columns: newColumns });

        await api.patch(`/tasks/${taskId}/move`, {
            column_id: destColId,
            order: destination.index,
        });
    };

    if (!board) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950">
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

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 p-6 overflow-x-auto min-h-[calc(100vh-65px)]">
                    {board.columns.map(column => (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            onAddTask={(colId) => { setActiveColumn(colId); setShowTaskModal(true); }}
                        />
                    ))}
                    {board.columns.length === 0 && (
                        <div className="flex items-center justify-center w-full">
                            <p className="text-gray-500">No columns yet. Add your first column!</p>
                        </div>
                    )}
                </div>
            </DragDropContext>

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