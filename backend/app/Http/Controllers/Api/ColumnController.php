<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Column;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function index(Board $board)
    {
        $this->authorize('view', $board);
        return response()->json($board->columns()->with('tasks')->get());
    }

    public function store(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $order = $board->columns()->count();
        $column = $board->columns()->create([
            'name' => $request->name,
            'order' => $order,
        ]);

        return response()->json($column, 201);
    }

    public function update(Request $request, Board $board, Column $column)
    {
        $this->authorize('update', $board);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'order' => 'sometimes|integer',
        ]);

        $column->update($request->all());
        return response()->json($column);
    }

    public function destroy(Board $board, Column $column)
    {
        $this->authorize('update', $board);
        $column->delete();
        return response()->json(['message' => 'Column deleted']);
    }
}
