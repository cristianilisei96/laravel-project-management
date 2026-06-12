<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'column_id' => 'required|exists:columns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'in:low,medium,high',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $order = Task::where('column_id', $request->column_id)->count();
        $task = Task::create(array_merge($request->all(), ['order' => $order]));
        $task->load('assignedUser');

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $task->update($request->all());
        $task->load('assignedUser');

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    public function move(Request $request, Task $task)
    {
        $request->validate([
            'column_id' => 'required|exists:columns,id',
            'order' => 'required|integer',
        ]);

        $task->update([
            'column_id' => $request->column_id,
            'order' => $request->order,
        ]);

        return response()->json($task);
    }
}
