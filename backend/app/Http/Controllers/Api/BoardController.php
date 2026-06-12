<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request)
    {
        $boards = $request->user()->boards()->withCount('columns')->get();
        return response()->json($boards);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $board = $request->user()->boards()->create($request->all());
        return response()->json($board, 201);
    }

    public function show(Request $request, Board $board)
    {
        $this->authorize('view', $board);

        $board->load(['columns.tasks.assignedUser']);
        return response()->json($board);
    }

    public function update(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $board->update($request->all());
        return response()->json($board);
    }

    public function destroy(Request $request, Board $board)
    {
        $this->authorize('delete', $board);
        $board->delete();
        return response()->json(['message' => 'Board deleted']);
    }
}
