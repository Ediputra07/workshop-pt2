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
        Schema::table('courses', function (Blueprint $table) {
            $table->string('day')->nullable()->after('schedule');
            $table->string('start_time', 5)->nullable()->after('day'); // HH:MM
            $table->string('end_time', 5)->nullable()->after('start_time');   // HH:MM
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['day', 'start_time', 'end_time']);
        });
    }
};
