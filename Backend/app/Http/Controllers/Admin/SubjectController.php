<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::withCount('students')->latest()->paginate(15);
        return view('admin.subjects.index', compact('subjects'));
    }

    public function create()
    {
        return view('admin.subjects.form', ['subject' => new Subject(), 'mode' => 'create']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_code' => ['required','string','max:30','unique:subjects,subject_code'],
            'subject_title' => ['required','string','max:150'],
            'units' => ['required','integer','min:1','max:10'],
            'instructor' => ['nullable','string','max:150'],
        ]);
        Subject::create($data);
        return redirect()->route('admin.subjects.index')->with('success', 'Subject created.');
    }

    public function edit(Subject $subject)
    {
        return view('admin.subjects.form', ['subject' => $subject, 'mode' => 'edit']);
    }

    public function update(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'subject_code' => ['required','string','max:30',Rule::unique('subjects','subject_code')->ignore($subject->id)],
            'subject_title' => ['required','string','max:150'],
            'units' => ['required','integer','min:1','max:10'],
            'instructor' => ['nullable','string','max:150'],
        ]);
        $subject->update($data);
        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete(); // Related enrollments and schedules cascade via database FKs.
        return redirect()->route('admin.subjects.index')->with('success', 'Subject deleted.');
    }
}
