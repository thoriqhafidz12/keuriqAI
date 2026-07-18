<?php

namespace App\Services;

use App\ValueObjects\FIFOResult;
use App\ValueObjects\FundSource;
use App\ValueObjects\FundAllocation;
use Illuminate\Support\Collection;

class FIFOService
{
    /**
     * Compute FIFO (First In, First Out) fund allocation.
     *
     * When expenses occur, funds are consumed from the oldest available source first:
     *   1. Initial balance (saldo_awal)
     *   2. Oldest income (penerimaan) by date
     *
     * This returns a complete breakdown of which fund sources were used for
     * which expenses and how much remains in each source.
     *
     * Ported from src/utils/fifo.ts:computeFIFO()
     */
    public function compute(Collection $transactions): FIFOResult
    {
        // Separate transactions by type
        $saldoAwal = $transactions->where('type', 'saldo_awal')->values();
        $incomes = $transactions->where('type', 'penerimaan')->values();
        $expenses = $this->sortByDate(
            $transactions->where('type', 'pengeluaran')->values()
        );

        // Build ordered fund sources: saldo_awal first (oldest), then incomes sorted by date
        $fundSources = [];

        // Add saldo_awal entries (sorted oldest first)
        foreach ($this->sortByDate($saldoAwal) as $tx) {
            $fundSources[] = [
                'transactionId' => $tx->id,
                'type' => 'saldo_awal',
                'date' => $tx->date instanceof \DateTimeInterface ? $tx->date->format('Y-m-d') : $tx->date,
                'category' => 'Saldo Awal',
                'source' => null,
                'description' => $tx->description ?? '',
                'originalAmount' => (int) $tx->amount,
                'usedAmount' => 0,
                'remainingAmount' => (int) $tx->amount,
                'allocations' => [],
            ];
        }

        // Add income entries (sorted oldest first)
        foreach ($this->sortByDate($incomes) as $tx) {
            $fundSources[] = [
                'transactionId' => $tx->id,
                'type' => 'penerimaan',
                'date' => $tx->date instanceof \DateTimeInterface ? $tx->date->format('Y-m-d') : $tx->date,
                'category' => $tx->category,
                'source' => $tx->source,
                'description' => $tx->description ?? '',
                'originalAmount' => (int) $tx->amount,
                'usedAmount' => 0,
                'remainingAmount' => (int) $tx->amount,
                'allocations' => [],
            ];
        }

        // Process each expense in date order (FIFO: consume oldest funds first)
        foreach ($expenses as $expense) {
            $remainingExpense = (int) $expense->amount;

            foreach ($fundSources as &$source) {
                if ($remainingExpense <= 0) break;
                if ($source['remainingAmount'] <= 0) continue;

                $amountFromSource = min($source['remainingAmount'], $remainingExpense);

                $source['usedAmount'] += $amountFromSource;
                $source['remainingAmount'] -= $amountFromSource;
                $source['allocations'][] = [
                    'expenseId' => $expense->id,
                    'expenseDate' => $expense->date instanceof \DateTimeInterface ? $expense->date->format('Y-m-d') : $expense->date,
                    'expenseCategory' => $expense->category,
                    'amount' => $amountFromSource,
                ];

                $remainingExpense -= $amountFromSource;
            }
            unset($source);
            // If remainingExpense > 0 here, expenses exceed available funds
            // (this is allowed — the balance just goes negative)
        }

        // Convert to Value Objects
        $sources = array_map(function ($s) {
            return new FundSource(
                transactionId: $s['transactionId'],
                type: $s['type'],
                date: $s['date'],
                category: $s['category'],
                source: $s['source'],
                description: $s['description'],
                originalAmount: $s['originalAmount'],
                usedAmount: $s['usedAmount'],
                remainingAmount: $s['remainingAmount'],
                allocations: array_map(
                    fn($a) => new FundAllocation(
                        expenseId: $a['expenseId'],
                        expenseDate: $a['expenseDate'],
                        expenseCategory: $a['expenseCategory'],
                        amount: $a['amount'],
                    ),
                    $s['allocations'],
                ),
            );
        }, $fundSources);

        $totalAvailable = array_sum(array_column($fundSources, 'originalAmount'));
        $totalUsed = array_sum(array_column($fundSources, 'usedAmount'));
        $totalBalance = $totalAvailable - $totalUsed;

        return new FIFOResult(
            sources: $sources,
            totalBalance: $totalBalance,
            totalAvailable: $totalAvailable,
            totalUsed: $totalUsed,
        );
    }

    private function sortByDate(Collection $items): Collection
    {
        return $items->sortBy(function ($item) {
            $date = $item->date;
            if ($date instanceof \DateTimeInterface) {
                return $date->format('Y-m-d');
            }
            return (string) $date;
        })->values();
    }
}
