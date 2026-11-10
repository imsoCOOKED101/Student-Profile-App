<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\ClassSchedule;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return view('admin.dashboard', [
            'studentCount' => Student::count(),
            'subjectCount' => Subject::count(),
            'scheduleCount' => ClassSchedule::count(),
            'announcementCount' => Announcement::count(),
            'userCount' => User::where('role', 'student')->count(),
        ]);
    }
}
