<?php

namespace App\Services;

use App\Models\Transaction;
use App\ValueObjects\BalanceResult;
use Illuminate\Support\Collection;

class BalanceService
{
    /**
     * Calculate the current balance from all transactions.
     * Ported from src/utils/balance.ts:calculateBalance()
     */
    public function calculate(Collection $transactions): BalanceResult
    {
        $initialBalance = 0;
        $totalIncome = 0;
        $totalExpenses = 0;

        foreach ($transactions as $tx) {
            switch ($tx->type) {
                case 'saldo_awal':
                    $initialBalance += $tx->amount;
                    break;
                case 'penerimaan':
                    $totalIncome += $tx->amount;
                    break;
                case 'pengeluaran':
                    $totalExpenses += $tx->amount;
                    break;
            }
        }

        return new BalanceResult(
            initialBalance: $initialBalance,
            totalIncome: $totalIncome,
            totalExpenses: $totalExpenses,
            currentBalance: $initialBalance + $totalIncome - $totalExpenses,
        );
    }

    /**
     * Get monthly summary: totals and category breakdowns for a specific month.
     * Ported from src/utils/balance.ts:getMonthlySummary()
     */
    public function monthlySummary(Collection $transactions, int $year, int $month): array
    {
        $monthTxs = $transactions->filter(function ($tx) use ($year, $month) {
            return $this->isInMonth($tx->date, $year, $month);
        });

        $income = 0;
        $expenses = 0;
        $incomeByCategory = [];
        $expensesByCategory = [];

        foreach ($monthTxs as $tx) {
            if ($tx->type === 'penerimaan') {
                $income += $tx->amount;
                $incomeByCategory[$tx->category] = ($incomeByCategory[$tx->category] ?? 0) + $tx->amount;
            } elseif ($tx->type === 'pengeluaran') {
                $expenses += $tx->amount;
                $expensesByCategory[$tx->category] = ($expensesByCategory[$tx->category] ?? 0) + $tx->amount;
            }
        }

        return [
            'income' => $income,
            'expenses' => $expenses,
            'balance' => $income - $expenses,
            'incomeByCategory' => $incomeByCategory,
            'expensesByCategory' => $expensesByCategory,
        ];
    }

    /**
     * Get yearly summary: monthly breakdowns for a specific year.
     * Ported from src/utils/balance.ts:getYearlySummary()
     */
    public function yearlySummary(Collection $transactions, int $year): array
    {
        $yearTxs = $transactions->filter(function ($tx) use ($year) {
            return $this->isInYear($tx->date, $year);
        });

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthTxs = $yearTxs->filter(function ($tx) use ($year, $m) {
                return $this->isInMonth($tx->date, $year, $m);
            });
            $income = 0;
            $expenses = 0;
            foreach ($monthTxs as $tx) {
                if ($tx->type === 'penerimaan') {
                    $income += $tx->amount;
                } elseif ($tx->type === 'pengeluaran') {
                    $expenses += $tx->amount;
                }
            }
            $months[] = [
                'month' => $m,
                'income' => $income,
                'expenses' => $expenses,
                'balance' => $income - $expenses,
            ];
        }
        return $months;
    }

    /**
     * Get cashflow data for charting: monthly income vs expense for a given year.
     * Ported from src/utils/balance.ts:getCashflowData()
     */
    public function cashflowData(Collection $transactions, int $year): array
    {
        $monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
        ];
        $summary = $this->yearlySummary($transactions, $year);
        return array_map(function ($m) use ($monthNames) {
            return [
                'month' => $monthNames[$m['month'] - 1],
                'penerimaan' => $m['income'],
                'pengeluaran' => $m['expenses'],
            ];
        }, $summary);
    }

    private function isInMonth($date, int $year, int $month): bool
    {
        $d = $date instanceof \DateTimeInterface ? $date : new \DateTime($date);
        return (int) $d->format('Y') === $year && (int) $d->format('n') === $month;
    }

    private function isInYear($date, int $year): bool
    {
        $d = $date instanceof \DateTimeInterface ? $date : new \DateTime($date);
        return (int) $d->format('Y') === $year;
    }
}
