<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['admin', 'warehouse_staff', 'billing_admin', 'customer_support']),
            'display_name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'module' => fake()->randomElement(['shipments', 'customers', 'warehouses', 'billing', 'users', 'analytics', 'settings', 'support']),
        ];
    }

    /**
     * Create admin role.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'Full system access',
            'module' => 'all',
        ]);
    }

    /**
     * Create warehouse staff role.
     */
    public function warehouseStaff(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'warehouse_staff',
            'display_name' => 'Warehouse Staff',
            'description' => 'Warehouse operations access',
            'module' => 'shipments',
        ]);
    }
}
