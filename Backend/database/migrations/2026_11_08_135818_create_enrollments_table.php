<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('semester', 50);
            $table->string('academic_year', 20);
            $table->string('status', 20)->default('enrolled');
            $table->decimal('grade', 4, 2)->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'subject_id', 'semester', 'academic_year'], 'enrollments_student_subject_term_unique');
            $table->index(['student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
