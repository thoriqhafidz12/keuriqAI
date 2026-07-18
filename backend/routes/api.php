<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\InstallmentController;
use App\Http\Controllers\Api\InstallmentPaymentController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\FIFOController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DepreciationController;
use Illuminate\Support\Facades\Route;

// ===== Public Auth Routes =====
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// ===== Protected Routes (Better Auth — Paseto V4 tokens) =====
Route::middleware(['auth:betterauth', 'auth.guard'])->group(function () {

    // --- Auth / Session ---
    Route::get('/auth/session', [AuthController::class, 'session']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // --- Transactions ---
    Route::apiResource('transactions', TransactionController::class);
    Route::get('/transactions/type/{type}', [TransactionController::class, 'byType'])
        ->where('type', 'saldo_awal|penerimaan|pengeluaran');
    Route::get('/transactions/date-range', [TransactionController::class, 'byDateRange']);

    // --- Installments ---
    Route::apiResource('installments', InstallmentController::class);

    // --- Installment Payments ---
    Route::get('/installments/{installment}/payments', [InstallmentPaymentController::class, 'index']);
    Route::post('/installments/{installment}/payments', [InstallmentPaymentController::class, 'store']);
    Route::delete('/payments/{payment}', [InstallmentPaymentController::class, 'destroy']);
    Route::get('/installments/{installment}/stats', [InstallmentPaymentController::class, 'stats']);

    // --- Assets ---
    Route::apiResource('assets', AssetController::class);
    Route::get('/assets/{asset}/history', [AssetController::class, 'history']);

    // --- Installment Periods ---
    Route::get('/installments/{installment}/periods', [InstallmentController::class, 'periods']);

    // --- Reports ---
    Route::get('/reports/balance', [ReportController::class, 'balance']);
    Route::get('/reports/fifo', [FIFOController::class, 'index']);
    Route::get('/reports/monthly-summary/{year}/{month}', [ReportController::class, 'monthlySummary'])
        ->where(['year' => '\d{4}', 'month' => '[1-9]|1[0-2]']);
    Route::get('/reports/yearly-summary/{year}', [ReportController::class, 'yearlySummary'])
        ->where('year', '\d{4}');
    Route::get('/reports/cashflow/{year}', [ReportController::class, 'cashflow'])
        ->where('year', '\d{4}');

    // --- Depreciation ---
    Route::get('/reports/depreciation', [DepreciationController::class, 'index']);
    Route::get('/reports/depreciation/{asset}', [DepreciationController::class, 'show']);
});
