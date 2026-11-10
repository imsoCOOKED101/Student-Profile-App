<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Assignment extends Model
{
    protected $fillable = ['subject_id', 'title', 'description', 'due_at'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime'];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_assignments')
            ->withPivot(['status', 'completed_at'])
            ->withTimestamps();
    }
}
