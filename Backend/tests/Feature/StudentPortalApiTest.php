<?php

namespace Tests\Feature;

use App\Models\StudentDocument;
use App\Models\User;
use Database\Seeders\PortalDemoSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentPortalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_login_and_update_profile(): void
    {
        $this->postJson('/api/auth/register', [
            'first_name' => 'Avery',
            'last_name' => 'Student',
            'email' => 'avery@example.test',
            'student_number' => '2026-0010',
            'course' => 'BS Information Technology',
            'year_level' => '1st Year',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ])->assertCreated()
            ->assertJsonPath('user.student.student_number', '2026-0010');

        $login = $this->postJson('/api/auth/login', [
            'identifier' => 'avery@example.test',
            'password' => 'SecurePass123!',
        ])->assertOk()->assertJsonStructure(['token', 'user']);

        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'avery@example.test');

        $this->withToken($token)->putJson('/api/profile', [
            'first_name' => 'Avery',
            'middle_name' => null,
            'last_name' => 'Student',
            'course' => 'BS Information Technology',
            'year_level' => '1st Year',
            'birthdate' => '2007-03-15',
            'gender' => 'Female',
            'nationality' => 'Filipino',
            'phone' => '+63 900 000 0000',
            'address' => 'Manila',
        ])->assertOk()->assertJsonPath('student.address', 'Manila');
    }

    public function test_private_portal_endpoints_require_a_token(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
        $this->getJson('/api/profile')->assertUnauthorized();
    }

    public function test_student_can_request_and_complete_a_password_reset(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset@example.test']);

        $this->postJson('/api/auth/password/forgot', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an account exists for that email, a password reset link has been sent.');
        Notification::assertSentTo($user, ResetPassword::class);

        $token = $user->createToken('existing-session')->plainTextToken;
        $resetToken = Password::createToken($user);

        $this->postJson('/api/auth/password/reset', [
            'token' => $resetToken,
            'email' => $user->email,
            'password' => 'NewSecurePass123!',
            'password_confirmation' => 'NewSecurePass123!',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewSecurePass123!', $user->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_seeded_student_can_load_dashboard_subjects_and_notifications(): void
    {
        $this->seed(PortalDemoSeeder::class);

        $login = $this->postJson('/api/auth/login', [
            'identifier' => 'student.demo@example.com',
            'password' => 'Student123!',
        ])->assertOk();
        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.enrolled_subjects', 6)
            ->assertJsonPath('stats.pending_assignments', 3);

        $this->withToken($token)->getJson('/api/subjects?status=enrolled')
            ->assertOk()
            ->assertJsonCount(6, 'subjects');

        $notificationResponse = $this->withToken($token)->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 3);
        $notificationId = $notificationResponse->json('notifications.data.0.id');
        $this->withToken($token)->patchJson("/api/notifications/{$notificationId}/read")
            ->assertOk()
            ->assertJsonPath('notification.is_read', true);

        $this->withToken($token)->getJson('/api/schedules')
            ->assertOk()
            ->assertJsonCount(6, 'schedules');

        $this->withToken($token)->getJson('/api/announcements')
            ->assertOk()
            ->assertJsonCount(4, 'data');

        $assignments = $this->withToken($token)->getJson('/api/assignments')
            ->assertOk()
            ->assertJsonCount(3, 'assignments');
        $assignmentId = $assignments->json('assignments.0.id');
        $this->withToken($token)->patchJson("/api/assignments/{$assignmentId}/complete")
            ->assertOk();

        $settings = $this->withToken($token)->patchJson('/api/settings', [
            'first_name' => 'Juan',
            'middle_name' => 'Dela',
            'last_name' => 'Cruz',
            'email' => 'juan.updated@example.test',
            'phone' => '+63 911 111 1111',
            'birthdate' => '2004-12-04',
            'course' => 'BS Information Technology',
            'year_level' => '3rd Year',
            'address' => 'Quezon City',
        ])->assertOk();
        $settings->assertJsonPath('user.email', 'juan.updated@example.test');

        $this->withToken($token)->patchJson('/api/settings', [
            'current_password' => 'Student123!',
            'password' => 'UpdatedPass123!',
            'password_confirmation' => 'UpdatedPass123!',
        ])->assertOk();
        $this->postJson('/api/auth/login', [
            'identifier' => 'juan.updated@example.test',
            'password' => 'UpdatedPass123!',
        ])->assertOk();

        Storage::fake('local');
        $document = $this->withToken($token)->post('/api/documents', [
            'name' => 'Transcript of Records',
            'file' => UploadedFile::fake()->create('transcript.pdf', 100, 'application/pdf'),
        ])->assertCreated();
        $document->assertJsonPath('document.name', 'Transcript of Records');
        $documentId = $document->json('document.id');
        $savedDocument = StudentDocument::findOrFail($documentId);
        Storage::disk('local')->assertExists($savedDocument->file_path);
        $this->withToken($token)->get("/api/documents/{$documentId}/download")->assertOk();

        $otherUser = User::factory()->create();
        $otherUserToken = $otherUser->createToken('other-user')->plainTextToken;
        Auth::forgetGuards();
        $this->withToken($otherUserToken)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.id', $otherUser->id);
        Auth::forgetGuards();
        $this->withToken($otherUserToken)->get("/api/documents/{$documentId}/download")->assertNotFound();
    }

    public function test_registration_cannot_create_duplicate_accounts(): void
    {
        User::factory()->create(['email' => 'taken@example.test']);

        $this->postJson('/api/auth/register', [
            'first_name' => 'Avery',
            'last_name' => 'Student',
            'email' => 'taken@example.test',
            'student_number' => '2026-0011',
            'course' => 'BS Information Technology',
            'year_level' => '1st Year',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }
}
