<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    public function index()
    {
        $student = Auth::user()->student;
        $subjects = $student ? $student->subjects()->with('schedules')->get() : collect();

        return view('subjects.index', compact('subjects'));
    }
}
