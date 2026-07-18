<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('installment_payments', function (Blueprint $table) {
            $table->unsignedSmallInteger('period_number')->nullable()->after('installment_id');
            $table->unique(['installment_id', 'period_number'], 'unique_installment_period');
        });
    }

    public function down(): void
    {
        Schema::table('installment_payments', function (Blueprint $table) {
            $table->dropUnique('unique_installment_period');
            $table->dropColumn('period_number');
        });
    }
};
