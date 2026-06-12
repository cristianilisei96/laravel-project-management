<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['column_id', 'user_id', 'title', 'description', 'deadline', 'priority', 'order'];

    public function column()
    {
        return $this->belongsTo(Column::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
