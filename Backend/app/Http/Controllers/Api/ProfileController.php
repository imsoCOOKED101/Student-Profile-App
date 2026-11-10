<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        abort_unless($student, 404, 'Student profile not found.');

        return response()->json([
            'student' => $student,
            'email' => $request->user()->email,
            'role' => $request->user()->role,
            'documents' => $student->documents()->latest('uploaded_at')->get([
                'id', 'student_id', 'name', 'mime_type', 'file_size', 'status', 'uploaded_at', 'created_at',
            ]),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        abort_unless($student, 404, 'Student profile not found.');

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'course' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:50'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'max:30'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($student, $user, $data): void {
            $student->update($data);
            $user->update([
                'name' => trim(implode(' ', array_filter([
                    $data['first_name'],
                    $data['middle_name'] ?? null,
                    $data['last_name'],
                ]))),
            ]);
        });

        return response()->json(['student' => $student->refresh(), 'user' => $user->refresh()]);
    }
}
