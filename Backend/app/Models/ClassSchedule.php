<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSchedule extends Model
{
    protected $fillable = ['subject_id', 'day', 'start_time', 'end_time', 'room', 'section'];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
