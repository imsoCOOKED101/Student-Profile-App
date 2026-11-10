<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDocument extends Model
{
    protected $fillable = ['student_id', 'name', 'file_path', 'mime_type', 'file_size', 'status', 'uploaded_at'];

    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return ['uploaded_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
