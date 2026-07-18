<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetChangeResource;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AssetController extends Controller
{
    /**
     * Get all assets for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $assets = $request->user()
            ->assets()
            ->orderBy('acquisition_date', 'desc')
            ->get();

        return AssetResource::collection($assets);
    }

    /**
     * Store a new asset with auto-generated register number.
     */
    public function store(StoreAssetRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate register number: REG-YYYYMM-XXX
        $data['register_number'] = $this->generateRegisterNumber($request->user()->id);

        $asset = $request->user()->assets()->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil disimpan.',
            'data' => new AssetResource($asset),
        ], 201);
    }

    /**
     * Show a single asset.
     */
    public function show(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new AssetResource($asset),
        ]);
    }

    /**
     * Update an asset and record change history.
     */
    public function update(UpdateAssetRequest $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $validated = $request->validated();

        // Capture original values before update
        $trackedFields = ['name', 'acquisition_value', 'acquisition_date', 'acquisition_year',
            'useful_life', 'residual_value', 'category', 'location', 'description'];
        $originalData = [];
        foreach ($trackedFields as $field) {
            $originalData[$field] = $asset->getOriginal()[$field] ?? $asset->{$field};
        }

        $asset->update($validated);

        // Record change history for each changed field
        $fieldLabels = [
            'name' => 'Nama Barang',
            'acquisition_value' => 'Harga Perolehan',
            'acquisition_date' => 'Tanggal Perolehan',
            'acquisition_year' => 'Tahun Perolehan',
            'useful_life' => 'Masa Manfaat',
            'residual_value' => 'Nilai Residu',
            'category' => 'Kategori',
            'location' => 'Lokasi',
            'description' => 'Keterangan',
        ];

        foreach ($trackedFields as $field) {
            $oldVal = $originalData[$field];
            $newVal = $asset->{$field};

            // Normalize for comparison
            if ($oldVal != $newVal) {
                $asset->changes()->create([
                    'user_id' => $request->user()->id,
                    'field' => $fieldLabels[$field] ?? $field,
                    'old_value' => (string) $oldVal,
                    'new_value' => (string) $newVal,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil diperbarui.',
            'data' => new AssetResource($asset->fresh()),
        ]);
    }

    /**
     * Delete an asset.
     */
    public function destroy(Request $request, Asset $asset): JsonResponse
    {
        if ($asset->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Tidak ditemukan.'], 404);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aset berhasil dihapus.',
        ]);
    }

    /**
     * Get change history for an asset.
     */
    public function history(Request $request, Asset $asset): AnonymousResourceCollection
    {
        if ($asset->user_id !== $request->user()->id) {
            abort(404);
        }

        $histories = $asset->changes()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return AssetChangeResource::collection($histories);
    }

    /**
     * Generate a unique register number in format: REG-YYYYMM-XXX
     */
    private function generateRegisterNumber(int $userId): string
    {
        $prefix = 'REG-' . date('Ym') . '-';

        $lastAsset = Asset::where('user_id', $userId)
            ->where('register_number', 'like', $prefix . '%')
            ->orderBy('register_number', 'desc')
            ->first();

        if ($lastAsset) {
            $lastSeq = (int) substr($lastAsset->register_number, -3);
            $newSeq = str_pad($lastSeq + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newSeq = '001';
        }

        return $prefix . $newSeq;
    }
}
