<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\ClassSchedule;
use App\Models\StudentNotification;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PortalDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $user = User::updateOrCreate(
            ['email' => 'student.demo@example.com'],
            [
                'name' => 'Juan Dela Cruz',
                'password' => Hash::make('Student123!'),
                'role' => 'student',
            ],
        );

        $student = $user->student()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'student_number' => '2024-0001',
                'first_name' => 'Juan',
                'middle_name' => 'Dela',
                'last_name' => 'Cruz',
                'course' => 'BS Information Technology',
                'year_level' => '3rd Year',
                'birthdate' => '2004-12-04',
                'gender' => 'Male',
                'nationality' => 'Filipino',
                'phone' => '+63 912 345 6789',
                'address' => 'Quezon City, Metro Manila',
            ],
        );

        $subjectData = [
            ['IT101', 'Introduction to Computing', 3, 'Prof. Maria Santos', 'Monday', '08:00', '10:00', 'Room 201'],
            ['IT102', 'Web Development', 3, 'Prof. John Garcia', 'Tuesday', '10:00', '12:00', 'Room 205'],
            ['IT103', 'Database Management', 3, 'Prof. Robert Flores', 'Wednesday', '13:00', '15:00', 'Room 301'],
            ['MATH101', 'College Algebra', 3, 'Prof. Mae Villanueva', 'Thursday', '09:00', '11:00', 'Room 402'],
            ['ENG101', 'English Communication', 3, 'Prof. Eric Cruz', 'Friday', '13:00', '15:00', 'Room 405'],
            ['PE1', 'Physical Education 1', 2, 'Prof. Jungkook', 'Saturday', '08:00', '10:00', 'Gym'],
        ];

        foreach ($subjectData as [$code, $title, $units, $instructor, $day, $start, $end, $room]) {
            $subject = Subject::updateOrCreate(
                ['subject_code' => $code],
                [
                    'subject_title' => $title,
                    'units' => $units,
                    'instructor' => $instructor,
                    'is_active' => true,
                ],
            );

            $student->subjects()->syncWithoutDetaching([
                $subject->id => [
                    'semester' => 'Second Semester',
                    'academic_year' => '2025-2026',
                    'status' => 'enrolled',
                ],
            ]);

            ClassSchedule::updateOrCreate(
                ['subject_id' => $subject->id, 'day' => $day],
                ['start_time' => "{$start}:00", 'end_time' => "{$end}:00", 'room' => $room],
            );
        }

        $assignmentData = [
            ['IT101', 'Submit activity 3', 'Complete the introduction to computing activity.', now()->endOfDay()],
            ['IT102', 'Build a personal portfolio', 'Create and submit a responsive personal portfolio.', now()->addDay()->endOfDay()],
            ['MATH101', 'Quiz 2 review', 'Review the assigned algebra practice problems.', now()->addDays(3)->startOfDay()],
        ];

        foreach ($assignmentData as [$code, $title, $description, $dueAt]) {
            $subject = Subject::where('subject_code', $code)->firstOrFail();
            $assignment = Assignment::updateOrCreate(
                ['subject_id' => $subject->id, 'title' => $title],
                ['description' => $description, 'due_at' => $dueAt],
            );
            $student->assignments()->syncWithoutDetaching([
                $assignment->id => ['status' => 'pending'],
            ]);
        }

        $notices = [
            ['Enrollment for 2nd Semester A.Y. 2025-2026', 'Check the enrollment schedule and prepare your requirements.', 'Academic'],
            ['IT Department Project Proposal Submission', 'All project proposals must be submitted before May 30.', 'Department'],
            ['Library Service Advisory', 'Library services are available on the posted campus schedule.', 'Campus'],
            ['Scholarship Program 2025', 'Applications for the academic year are now open.', 'Scholarship'],
        ];

        foreach ($notices as [$title, $message, $type]) {
            Announcement::updateOrCreate(
                ['title' => $title],
                ['message' => $message, 'type' => $type, 'author_id' => null, 'published_at' => now(), 'is_active' => true],
            );
        }

        foreach ([
            ['New Announcement', 'Enrollment for 2nd Semester A.Y. 2025-2026', 'announcement'],
            ['Task Reminder', 'IT101 activity 3 is due today.', 'assignment'],
            ['Schedule Update', 'Your weekly class schedule is ready.', 'schedule'],
        ] as [$title, $message, $type]) {
            StudentNotification::updateOrCreate(
                ['user_id' => $user->id, 'title' => $title],
                ['message' => $message, 'type' => $type, 'is_read' => false],
            );
        }
    }
}
