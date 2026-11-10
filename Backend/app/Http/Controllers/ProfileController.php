<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function index() { return view('profile.index', ['student' => Auth::user()->student]); }

    public function update(Request $request)
    {
        $student = Auth::user()->student;
        abort_unless($student, 404);
        $data = $request->validate([
            'first_name' => ['required','string','max:100'], 'middle_name' => ['nullable','string','max:100'],
            'last_name' => ['required','string','max:100'], 'phone' => ['nullable','string','max:30'],
            'address' => ['nullable','string','max:255'], 'birthdate' => ['nullable','date'],
            'gender' => ['nullable','string','max:30'],
        ]);
        $student->update($data);
        Auth::user()->update(['name' => trim($data['first_name'].' '.$data['last_name'])]);
        return back()->with('success', 'Profile updated successfully.');
    }
}
