<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    public function index() { return view('settings.index'); }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email,'.Auth::id()],
            'current_password' => ['nullable','required_with:password'],
            'password' => ['nullable','min:8','confirmed'],
        ]);
        $user = Auth::user();
        if (!empty($data['password'])) {
            if (!Hash::check($data['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'Current password is incorrect.']);
            }
            $user->password = Hash::make($data['password']);
        }
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->save();
        return back()->with('success', 'Account settings saved.');
    }
}
