<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'description',
        'is_public',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'array',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who last updated this setting.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = "setting.{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, ?string $description = null, bool $isPublic = false, ?User $user = null): void
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description,
                'is_public' => $isPublic,
                'updated_by' => $user?->id,
            ]
        );

        // Clear cache
        Cache::forget("setting.{$key}");
        Cache::forget('settings.public');
    }

    /**
     * Get all public settings for frontend.
     */
    public static function getPublic(): array
    {
        return Cache::remember('settings.public', 3600, function () {
            return static::where('is_public', true)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Get all settings grouped by category.
     */
    public static function getGrouped(): array
    {
        $settings = static::all();
        $grouped = [];

        foreach ($settings as $setting) {
            $parts = explode('.', $setting->key);
            $category = $parts[0] ?? 'general';

            if (! isset($grouped[$category])) {
                $grouped[$category] = [];
            }

            $grouped[$category][$setting->key] = [
                'value' => $setting->value,
                'description' => $setting->description,
                'is_public' => $setting->is_public,
                'updated_at' => $setting->updated_at,
                'updated_by' => $setting->updatedBy?->name,
            ];
        }

        return $grouped;
    }

    /**
     * Clear all settings cache.
     */
    public static function clearCache(): void
    {
        $keys = static::pluck('key');

        foreach ($keys as $key) {
            Cache::forget("setting.{$key}");
        }

        Cache::forget('settings.public');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget('settings.public');
        });

        static::deleted(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget('settings.public');
        });
    }

    /**
     * Scope query to get public settings.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope query to get settings by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('key', 'like', "{$category}.%");
    }
}
