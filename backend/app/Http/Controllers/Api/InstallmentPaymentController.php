<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInstallmentPaymentRequest;
use App\Http\Resources\InstallmentPaymentResource;
use App\Models\Installment;
use App\Services\InstallmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstallmentPaymentController extends Controller
{
    public function __construct(
        private readonly InstallmentService $installmentService,
    ) {}

    /**
     * Get all payments for an installment.
     */
    public function index(Request $request, Installment $installment): AnonymousResourceCollection
    {
        if ($installment->user_id !== $request->user()->id) {
            abort(404);
        }

        $payments = $installment->payments()
            ->orderBy('date', 'desc')
            ->get();

        return InstallmentPaymentResource::collection($payments);
    }

    /**
     * Record a payment for an installment.
     * Automatically creates an expense transaction and checks paid_off status.
     */
    public function store(StoreInstallmentPaymentRequest $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Cicilan tidak ditemukan.'], 404);
        }

        try {
            $result = $this->installmentService->processPayment(
                installment: $installment,
                data: $request->validated(),
                user: $request->user(),
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dicatat.',
            'data' => [
                'payment' => new InstallmentPaymentResource($result['payment']),
                'stats' => $this->installmentService->getStats(
                    $installment->fresh(),
                    $installment->payments()->get(),
                )->toArray(),
            ],
        ], 201);
    }

    /**
     * Delete a payment and its linked expense transaction.
     */
    public function destroy(Request $request, $paymentId): JsonResponse
    {
        $payment = $request->user()
            ->installmentPayments()
            ->findOrFail($paymentId);

        // Delete linked expense transaction
        if ($payment->expenseTransaction) {
            $payment->expenseTransaction->delete();
        }

        // Re-check installment status
        $installment = $payment->installment;
        if ($installment->status === 'paid_off') {
            $remaining = $installment->payments()
                ->where('id', '!=', $payment->id)
                ->sum('amount');
            $totalOwed = (int) $installment->total_price - (int) $installment->down_payment;
            if ($remaining < $totalOwed) {
                $installment->update(['status' => 'active']);
            }
        }

        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus.',
        ]);
    }

    /**
     * Get installment statistics.
     */
    public function stats(Request $request, Installment $installment): JsonResponse
    {
        if ($installment->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $stats = $this->installmentService->getStats(
            $installment,
            $installment->payments()->get(),
        );

        return response()->json([
            'success' => true,
            'data' => $stats->toArray(),
        ]);
    }
}
