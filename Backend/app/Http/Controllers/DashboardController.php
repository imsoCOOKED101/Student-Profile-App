<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\ClassSchedule;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $subjects = $student ? $student->subjects()->with('schedules')->get() : collect();
        $schedules = ClassSchedule::with('subject')->whereHas('subject.students', function ($q) use ($student) {
            if ($student) $q->where('students.id', $student->id);
            else $q->whereRaw('1 = 0');
        })->orderBy('day')->orderBy('start_time')->take(6)->get();
        $announcements = Announcement::latest('published_at')->take(4)->get();
        $unreadCount = Auth::user()->studentNotifications()->where('is_read', false)->count();
        return view('dashboard.index', compact('student','subjects','schedules','announcements','unreadCount'));
    }
}
