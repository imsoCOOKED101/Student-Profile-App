<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        return response()->json(['documents' => $student->documents()->latest('uploaded_at')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        abort_unless($student, 404, 'Student profile not found.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $file = $data['file'];
        $path = $file->store("student-documents/{$student->id}", 'local');
        $document = $student->documents()->create([
            'name' => $data['name'],
            'file_path' => $path,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'file_size' => $file->getSize(),
            'status' => 'pending',
            'uploaded_at' => now(),
        ]);

        return response()->json(['document' => $document], 201);
    }

    public function download(Request $request, StudentDocument $document): StreamedResponse
    {
        abort_unless($request->user()->student?->id === $document->student_id, 404);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404, 'Document file not found.');

        return Storage::disk('local')->download($document->file_path, basename($document->file_path));
    }
}
