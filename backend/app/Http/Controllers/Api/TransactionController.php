<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    /**
     * Get all transactions for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $transactions = $request->user()
            ->transactions()
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        return TransactionResource::collection($transactions);
    }

    /**
     * Store a new transaction.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $tx = $request->user()->transactions()->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil disimpan.',
            'data' => new TransactionResource($tx),
        ], 201);
    }

    /**
     * Show a single transaction.
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Update an existing transaction.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $transaction->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diperbarui.',
            'data' => new TransactionResource($transaction->fresh()),
        ]);
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        // Delete linked installment payments first (to avoid FK issues)
        $transaction->installmentPayments()->delete();
        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus.',
        ]);
    }

    /**
     * Get transactions filtered by type.
     */
    public function byType(Request $request, string $type): AnonymousResourceCollection
    {
        $transactions = $request->user()
            ->transactions()
            ->where('type', $type)
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        return TransactionResource::collection($transactions);
    }

    /**
     * Get transactions filtered by date range.
     */
    public function byDateRange(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->transactions()->orderBy('date');

        if ($from = $request->query('from')) {
            $query->where('date', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->where('date', '<=', $to);
        }

        return TransactionResource::collection($query->get());
    }
}
