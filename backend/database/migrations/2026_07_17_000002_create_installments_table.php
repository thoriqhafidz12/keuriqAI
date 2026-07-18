<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('total_price', 15, 0);
            $table->decimal('down_payment', 15, 0)->default(0);
            $table->unsignedSmallInteger('tenor');
            $table->date('start_date');
            $table->decimal('monthly_amount', 15, 0);
            $table->enum('status', ['active', 'paid_off'])->default('active');
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
