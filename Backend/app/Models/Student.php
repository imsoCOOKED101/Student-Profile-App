<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'user_id', 'student_number', 'first_name', 'middle_name', 'last_name',
        'course', 'year_level', 'birthdate', 'gender', 'nationality', 'phone', 'address',
    ];

    protected $casts = ['birthdate' => 'date'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'enrollments')
            ->withPivot(['semester', 'academic_year', 'status', 'grade'])->withTimestamps();
    }

    public function assignments(): BelongsToMany
    {
        return $this->belongsToMany(Assignment::class, 'student_assignments')
            ->withPivot(['status', 'completed_at'])->withTimestamps();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }
}
