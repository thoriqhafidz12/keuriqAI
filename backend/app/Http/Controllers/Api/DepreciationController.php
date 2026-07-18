<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\DepreciationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepreciationController extends Controller
{
    public function __construct(
        private readonly DepreciationService $depreciationService,
    ) {}

    /**
     * Get aggregated depreciation for all assets.
     */
    public function index(Request $request): JsonResponse
    {
        $assets = $request->user()->assets()->get();

        $schedules = $assets->map(fn(Asset $asset) =>
            $this->depreciationService->computeSchedule($asset)
        );

        $aggregated = $this->depreciationService->getAggregated($schedules);

        return response()->json([
            'success' => true,
            'data' => $aggregated,
        ]);
    }

    /**
     * Get depreciation schedule for a single asset.
     */
    public function show(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $schedule = $this->depreciationService->computeSchedule($asset);

        return response()->json([
            'success' => true,
            'data' => $schedule->toArray(),
        ]);
    }
}
