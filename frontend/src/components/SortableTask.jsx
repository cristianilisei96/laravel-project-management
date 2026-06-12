import { Draggable } from '@hello-pangea/dnd';
import api from '../services/api';

const priorityColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
};

export default function SortableTask({ task, index, onDelete, onEdit }) {
    const handleDelete = async (e) => {
        e.stopPropagation();
        await api.delete(`/tasks/${task.id}`);
        onDelete(task.id);
    };

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing group relative ${snapshot.isDragging ? 'opacity-50 shadow-2xl' : ''}`}
                >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            className="text-gray-500 hover:text-indigo-400 text-xs"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-500 hover:text-red-400 text-xs"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-white text-sm font-medium pr-10">{task.title}</p>
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
            )}
        </Draggable>
    );
}