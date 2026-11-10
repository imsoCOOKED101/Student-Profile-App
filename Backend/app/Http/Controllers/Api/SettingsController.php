<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('student'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;
        $data = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'birthdate' => ['sometimes', 'nullable', 'date', 'before:today'],
            'course' => ['sometimes', 'required', 'string', 'max:150'],
            'year_level' => ['sometimes', 'required', 'string', 'max:50'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'current_password' => ['required_with:password', 'string'],
            'password' => ['sometimes', 'required', 'string', 'min:8', 'confirmed'],
        ]);

        if (isset($data['password']) && ! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        DB::transaction(function () use ($data, $user, $student): void {
            $studentFields = collect($data)->only([
                'first_name', 'middle_name', 'last_name', 'phone', 'birthdate', 'course', 'year_level', 'address',
            ]);
            if ($student && $studentFields->isNotEmpty()) {
                $student->update($studentFields->all());
            }

            if ($student && (array_key_exists('first_name', $data) || array_key_exists('last_name', $data))) {
                $name = trim(implode(' ', array_filter([
                    $data['first_name'] ?? $student->first_name,
                    $data['middle_name'] ?? $student->middle_name,
                    $data['last_name'] ?? $student->last_name,
                ])));
                $user->name = $name;
            }

            $user->fill(collect($data)->only(['email', 'password'])->all());
            $user->save();
        });

        return response()->json(['user' => $user->load('student')]);
    }
}
