<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\ClassSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $subjects = $student->subjects()
            ->wherePivot('status', 'enrolled')
            ->with('schedules')
            ->orderBy('subject_code')
            ->get();

        $schedules = ClassSchedule::query()
            ->whereHas('subject.students', fn ($query) => $query->whereKey($student->id)->where('enrollments.status', 'enrolled'))
            ->with('subject:id,subject_code,subject_title,instructor')
            ->orderBy('start_time')
            ->get();

        $assignments = $student->assignments()
            ->wherePivot('status', 'pending')
            ->with('subject:id,subject_code,subject_title')
            ->orderBy('due_at')
            ->limit(5)
            ->get();

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->orderByDesc('published_at')
            ->limit(4)
            ->get();

        $today = now()->format('l');

        return response()->json([
            'student' => $student,
            'stats' => [
                'enrolled_subjects' => $subjects->count(),
                'classes_this_week' => $schedules->count(),
                'pending_assignments' => $student->assignments()->wherePivot('status', 'pending')->count(),
                'unread_notifications' => $request->user()->studentNotifications()->where('is_read', false)->count(),
            ],
            'today_schedule' => $schedules->where('day', $today)->values(),
            'subjects' => $subjects,
            'assignments' => $assignments,
            'announcements' => $announcements,
        ]);
    }
}
