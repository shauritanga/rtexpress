<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sku',
        'name',
        'description',
        'category',
        'weight_kg',
        'dimensions_length_cm',
        'dimensions_width_cm',
        'dimensions_height_cm',
        'hazardous_material',
        'temperature_controlled',
        'fragile',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight_kg' => 'decimal:2',
        'dimensions_length_cm' => 'decimal:2',
        'dimensions_width_cm' => 'decimal:2',
        'dimensions_height_cm' => 'decimal:2',
        'hazardous_material' => 'boolean',
        'temperature_controlled' => 'boolean',
        'fragile' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
