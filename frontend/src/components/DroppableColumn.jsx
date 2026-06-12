import { Droppable } from '@hello-pangea/dnd';
import SortableTask from './SortableTask';

export default function DroppableColumn({ column, onAddTask }) {
    return (
        <div className="bg-gray-900 rounded-xl p-4 w-72 flex-shrink-0 self-start">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">{column.name}</h3>
                <span className="text-gray-500 text-xs">{column.tasks.length}</span>
            </div>

            <button
                onClick={() => onAddTask(column.id)}
                className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 hover:bg-gray-800 rounded-lg transition mb-4"
            >
                + Add Task
            </button>

            <Droppable droppableId={String(column.id)}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 mb-3 min-h-[80px] rounded-lg transition-all ${snapshot.isDraggingOver ? 'bg-indigo-500/10 ring-2 ring-indigo-500' : ''}`}
                    >
                        {column.tasks.map((task, index) => (
                            <SortableTask key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

           
        </div>
    );
}