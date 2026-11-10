<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $assignments = $student->assignments()
            ->with('subject:id,subject_code,subject_title')
            ->orderByRaw("CASE student_assignments.status WHEN 'pending' THEN 0 ELSE 1 END")
            ->orderBy('due_at')
            ->get();

        return response()->json(['assignments' => $assignments]);
    }

    public function complete(Request $request, int $assignment): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $record = $student->assignments()->whereKey($assignment)->first();
        abort_unless($record, 404, 'Assignment not found.');

        $student->assignments()->updateExistingPivot($record->id, [
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json(['message' => 'Assignment marked as complete.']);
    }
}
