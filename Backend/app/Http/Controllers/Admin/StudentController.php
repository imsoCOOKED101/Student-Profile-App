<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with('user')->latest()->paginate(15);
        return view('admin.students.index', compact('students'));
    }

    public function create()
    {
        return view('admin.students.form', ['student' => new Student(), 'user' => new User(), 'mode' => 'create']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_number' => ['required','string','max:50','unique:students,student_number'],
            'first_name' => ['required','string','max:100'],
            'middle_name' => ['nullable','string','max:100'],
            'last_name' => ['required','string','max:100'],
            'email' => ['required','email','max:255','unique:users,email'],
            'course' => ['nullable','string','max:150'],
            'year_level' => ['nullable','string','max:50'],
            'password' => ['required','string','min:8'],
        ]);

        DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => trim($data['first_name'].' '.$data['last_name']),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'student',
            ]);
            Student::create([
                'user_id' => $user->id,
                'student_number' => $data['student_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'course' => $data['course'] ?? null,
                'year_level' => $data['year_level'] ?? null,
            ]);
        });

        return redirect()->route('admin.students.index')->with('success', 'Student account created.');
    }

    public function edit(Student $student)
    {
        $student->load('user');
        return view('admin.students.form', ['student' => $student, 'user' => $student->user, 'mode' => 'edit']);
    }

    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'student_number' => ['required','string','max:50',Rule::unique('students','student_number')->ignore($student->id)],
            'first_name' => ['required','string','max:100'],
            'middle_name' => ['nullable','string','max:100'],
            'last_name' => ['required','string','max:100'],
            'email' => ['required','email','max:255',Rule::unique('users','email')->ignore($student->user_id)],
            'course' => ['nullable','string','max:150'],
            'year_level' => ['nullable','string','max:50'],
            'password' => ['nullable','string','min:8'],
        ]);

        DB::transaction(function () use ($data, $student) {
            $student->update([
                'student_number' => $data['student_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'course' => $data['course'] ?? null,
                'year_level' => $data['year_level'] ?? null,
            ]);
            $student->user->name = trim($data['first_name'].' '.$data['last_name']);
            $student->user->email = $data['email'];
            if (!empty($data['password'])) $student->user->password = Hash::make($data['password']);
            $student->user->save();
        });

        return redirect()->route('admin.students.index')->with('success', 'Student updated.');
    }

    public function destroy(Student $student)
    {
        // The linked user is removed too; related enrollments/notifications cascade.
        $student->user()->delete();
        return redirect()->route('admin.students.index')->with('success', 'Student deleted.');
    }
}
