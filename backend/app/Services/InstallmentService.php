<?php

namespace App\Services;

use App\Models\Installment;
use App\Models\InstallmentPayment;
use App\Models\Transaction;
use App\Models\User;
use App\ValueObjects\InstallmentStats;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InstallmentService
{
    /**
     * Compute installment payment statistics.
     */
    public function getStats(Installment $installment, Collection $payments): InstallmentStats
    {
        $totalOwed = (int) $installment->total_price - (int) $installment->down_payment;

        $totalPaid = $payments->sum('amount');

        $remaining = max(0, $totalOwed - $totalPaid);
        $paidPercentage = $totalOwed > 0 ? $totalPaid / $totalOwed : 1;
        $paidPeriods = $payments->whereNotNull('period_number')->count();
        $remainingPeriods = max(0, $installment->tenor - $paidPeriods);
        $isPaidOff = $remaining <= 0 || $installment->status === 'paid_off';

        return new InstallmentStats(
            totalPaid: $totalPaid,
            remaining: $remaining,
            paidPercentage: $paidPercentage,
            remainingMonths: $remainingPeriods,
            isPaidOff: $isPaidOff,
        );
    }

    /**
     * Generate all periods (1..tenor) with payment status for an installment.
     */
    public function getPeriods(Installment $installment): array
    {
        $tenor = $installment->tenor;
        $startDate = $installment->start_date instanceof \DateTimeInterface
            ? clone $installment->start_date
            : new \DateTime($installment->start_date);

        $payments = $installment->payments()
            ->whereNotNull('period_number')
            ->get()
            ->keyBy('period_number');

        $periods = [];
        for ($i = 1; $i <= $tenor; $i++) {
            $dueDate = (clone $startDate)->modify('+' . ($i - 1) . ' months');
            $payment = $payments->get($i);

            $periods[] = [
                'periodNumber' => $i,
                'amount' => (int) $installment->monthly_amount,
                'dueDate' => $dueDate->format('Y-m-d'),
                'status' => $payment ? 'paid' : 'unpaid',
                'payment' => $payment ? [
                    'id' => $payment->id,
                    'date' => $payment->date instanceof \DateTimeInterface ? $payment->date->format('Y-m-d') : $payment->date,
                    'amount' => (int) $payment->amount,
                    'description' => $payment->description,
                ] : null,
            ];
        }

        return $periods;
    }

    /**
     * Process an installment payment: creates the payment record AND
     * auto-creates an expense transaction, then checks if paid off.
     * Now includes period_number validation.
     */
    public function processPayment(Installment $installment, array $data, User $user): array
    {
        return DB::transaction(function () use ($installment, $data, $user) {
            $periodNumber = $data['period_number'];

            // Validate: period within range
            if ($periodNumber < 1 || $periodNumber > $installment->tenor) {
                throw new \InvalidArgumentException('Periode tidak valid. Maksimal periode: ' . $installment->tenor);
            }

            // Validate: one payment per period
            $existing = $installment->payments()
                ->where('period_number', $periodNumber)
                ->exists();

            if ($existing) {
                throw new \InvalidArgumentException('Periode ke-' . $periodNumber . ' sudah dibayar.');
            }

            // Validate: amount does not exceed remaining
            $totalPaid = $installment->payments()->sum('amount');
            $totalOwed = (int) $installment->total_price - (int) $installment->down_payment;
            $remaining = $totalOwed - $totalPaid;

            if ($data['amount'] > $remaining) {
                throw new \InvalidArgumentException(
                    'Jumlah pembayaran melebihi sisa cicilan (Rp ' . number_format($remaining, 0, ',', '.') . ').'
                );
            }

            // Auto-create expense transaction
            $description = 'Bayar cicilan: ' . $installment->name;
            if (!empty($data['description'])) {
                $description .= ' - ' . $data['description'];
            }

            $expenseTx = Transaction::create([
                'user_id' => $user->id,
                'date' => $data['date'],
                'type' => 'pengeluaran',
                'category' => 'Cicilan',
                'amount' => $data['amount'],
                'description' => $description,
            ]);

            // Create payment with period_number
            $payment = InstallmentPayment::create([
                'user_id' => $user->id,
                'installment_id' => $installment->id,
                'period_number' => $periodNumber,
                'date' => $data['date'],
                'amount' => $data['amount'],
                'description' => $data['description'] ?? '',
                'expense_transaction_id' => $expenseTx->id,
            ]);

            // Check if all periods are paid
            $paidPeriods = $installment->payments()
                ->whereNotNull('period_number')
                ->distinct('period_number')
                ->count('period_number');

            if ($paidPeriods >= $installment->tenor && $installment->status !== 'paid_off') {
                $installment->update(['status' => 'paid_off']);
            }

            return [
                'payment' => $payment,
                'expenseTransaction' => $expenseTx,
            ];
        });
    }
}
