<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInstallmentRequest;
use App\Http\Resources\InstallmentResource;
use App\Models\Installment;
use App\Services\InstallmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstallmentController extends Controller
{
    public function __construct(
        private readonly InstallmentService $installmentService,
    ) {}
    /**
     * Get all installments for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $installments = $request->user()
            ->installments()
            ->orderBy('start_date', 'desc')
            ->get();

        return InstallmentResource::collection($installments);
    }

    /**
     * Store a new installment.
     */
    public function store(StoreInstallmentRequest $request): JsonResponse
    {
        $inst = $request->user()->installments()->create([
            ...$request->validated(),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cicilan berhasil disimpan.',
            'data' => new InstallmentResource($inst),
        ], 201);
    }

    /**
     * Show a single installment.
     */
    public function show(Request $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new InstallmentResource($installment),
        ]);
    }

    /**
     * Update an installment.
     */
    public function update(Request $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'total_price' => ['sometimes', 'integer', 'min:1'],
            'down_payment' => ['sometimes', 'integer', 'min:0'],
            'tenor' => ['sometimes', 'integer', 'min:1'],
            'start_date' => ['sometimes', 'date'],
            'monthly_amount' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'string', 'in:active,paid_off'],
        ]);

        $installment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cicilan berhasil diperbarui.',
            'data' => new InstallmentResource($installment->fresh()),
        ]);
    }

    /**
     * Delete an installment and its payments. Any linked expense transactions
     * are also deleted.
     */
    public function destroy(Request $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        // Delete linked expense transactions
        foreach ($installment->payments as $payment) {
            if ($payment->expenseTransaction) {
                $payment->expenseTransaction->delete();
            }
        }

        $installment->payments()->delete();
        $installment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cicilan berhasil dihapus.',
        ]);
    }

    /**
     * Get all periods for an installment with payment status.
     */
    public function periods(Request $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $periods = $this->installmentService->getPeriods($installment);

        return response()->json([
            'success' => true,
            'data' => $periods,
        ]);
    }
}
