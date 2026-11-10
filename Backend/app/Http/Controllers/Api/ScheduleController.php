<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $schedules = ClassSchedule::query()
            ->whereHas('subject.students', fn ($query) => $query->whereKey($student->id)->where('enrollments.status', 'enrolled'))
            ->with('subject:id,subject_code,subject_title,instructor')
            ->orderByRaw("CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 ELSE 8 END")
            ->orderBy('start_time')
            ->get();

        return response()->json(['schedules' => $schedules]);
    }
}
