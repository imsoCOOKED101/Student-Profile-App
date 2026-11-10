<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'student_number' => ['required', 'string', 'max:50', 'unique:students,student_number'],
            'course' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => trim($data['first_name'].' '.$data['last_name']),
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'student',
            ]);

            $user->student()->create([
                'student_number' => $data['student_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'course' => $data['course'],
                'year_level' => $data['year_level'],
            ]);

            return $user->load('student');
        });

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::query()
            ->where('email', $data['identifier'])
            ->orWhereHas('student', fn ($query) => $query->where('student_number', $data['identifier']))
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken(
            $data['device_name'] ?? 'student-portal',
            ['*'],
            now()->addDays(30),
        )->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('student'),
        ]);
    }

    public function sendPasswordResetLink(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);
        $status = Password::sendResetLink($data);

        if ($status === Password::RESET_LINK_SENT || $status === Password::INVALID_USER) {
            return response()->json([
                'message' => 'If an account exists for that email, a password reset link has been sent.',
            ]);
        }

        return response()->json(['message' => 'Unable to send a password reset link.'], 500);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset($data, function (User $user, string $password): void {
            $user->forceFill(['password' => $password])->save();
            $user->tokens()->delete();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['This password reset link is invalid or has expired.'],
            ]);
        }

        return response()->json(['message' => 'Your password has been reset.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->load('student')]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
