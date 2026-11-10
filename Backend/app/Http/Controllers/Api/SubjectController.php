<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $status = $request->query('status', 'enrolled');
        abort_unless(in_array($status, ['enrolled', 'completed'], true), 422, 'Invalid subject status.');

        $subjects = $student->subjects()
            ->wherePivot('status', $status)
            ->with('schedules')
            ->orderBy('subject_code')
            ->get();

        return response()->json(['subjects' => $subjects]);
    }
}
