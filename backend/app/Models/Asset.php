<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $fillable = [
        'user_id',
        'register_number',
        'name',
        'category',
        'location',
        'acquisition_value',
        'acquisition_date',
        'acquisition_year',
        'useful_life',
        'residual_value',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'acquisition_date' => 'date',
            'acquisition_value' => 'int',
            'residual_value' => 'int',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function changes(): HasMany
    {
        return $this->hasMany(AssetChange::class);
    }
}
