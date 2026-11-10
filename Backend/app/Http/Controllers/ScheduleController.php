<?php

namespace App\Http\Controllers;

use App\Models\ClassSchedule;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $schedules = ClassSchedule::with('subject')->whereHas('subject.students', function ($q) use ($student) {
            if ($student) $q->where('students.id', $student->id);
            else $q->whereRaw('1 = 0');
        })->orderBy('start_time')->get();
        return view('schedules.index', compact('schedules'));
    }
}
