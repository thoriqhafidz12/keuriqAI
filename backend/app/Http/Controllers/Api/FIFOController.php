<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FIFOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FIFOController extends Controller
{
    public function __construct(
        private readonly FIFOService $fifoService,
    ) {}

    /**
     * Compute FIFO allocation for all transactions of the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->transactions()
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $result = $this->fifoService->compute($transactions);

        return response()->json([
            'success' => true,
            'data' => $result->toArray(),
        ]);
    }
}
