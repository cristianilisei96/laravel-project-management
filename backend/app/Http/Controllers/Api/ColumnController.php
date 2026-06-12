<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Column;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function index(Request $request, Board $board)
    {
        if ($request->user()->id !== $board->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($board->columns()->with('tasks')->get());
    }

    public function store(Request $request, Board $board)
    {
        if ($request->user()->id !== $board->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

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
        if ($request->user()->id !== $board->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'order' => 'sometimes|integer',
        ]);

        $column->update($request->all());
        return response()->json($column);
    }

    public function destroy(Request $request, Board $board, Column $column)
    {
        if ($request->user()->id !== $board->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $column->delete();
        return response()->json(['message' => 'Column deleted']);
    }
}
