<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BalanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly BalanceService $balanceService,
    ) {}

    /**
     * Get current balance summary.
     */
    public function balance(Request $request): JsonResponse
    {
        $transactions = $request->user()->transactions()->get();
        $result = $this->balanceService->calculate($transactions);

        return response()->json([
            'success' => true,
            'data' => $result->toArray(),
        ]);
    }

    /**
     * Get monthly summary for a specific year/month.
     */
    public function monthlySummary(Request $request, int $year, int $month): JsonResponse
    {
        $transactions = $request->user()->transactions()->get();
        $summary = $this->balanceService->monthlySummary($transactions, $year, $month);

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Get yearly summary (by month) for a specific year.
     */
    public function yearlySummary(Request $request, int $year): JsonResponse
    {
        $transactions = $request->user()->transactions()->get();
        $summary = $this->balanceService->yearlySummary($transactions, $year);

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Get cashflow data for charting.
     */
    public function cashflow(Request $request, int $year): JsonResponse
    {
        $transactions = $request->user()->transactions()->get();
        $data = $this->balanceService->cashflowData($transactions, $year);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
