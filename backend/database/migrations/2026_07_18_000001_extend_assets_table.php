<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->string('register_number')->nullable()->after('id');
            $table->string('category', 100)->nullable()->after('name');
            $table->string('location', 255)->nullable()->after('category');
            $table->text('description')->nullable()->after('residual_value');

            $table->index('register_number');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['register_number', 'category', 'location', 'description']);
        });
    }
};
