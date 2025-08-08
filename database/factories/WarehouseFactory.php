<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warehouse>
 */
class WarehouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = 'WAR-'.str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);

        return [
            'code' => $code,
            'name' => $this->faker->company().' Warehouse',
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->optional()->secondaryAddress(),
            'city' => $this->faker->city(),
            'state_province' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'latitude' => $this->faker->latitude(-11.7, -1.0), // Tanzania coordinates
            'longitude' => $this->faker->longitude(29.3, 40.5), // Tanzania coordinates
            'capacity_cubic_meters' => $this->faker->randomFloat(2, 1000, 10000),
            'operating_hours' => [
                'monday' => '08:00-17:00',
                'tuesday' => '08:00-17:00',
                'wednesday' => '08:00-17:00',
                'thursday' => '08:00-17:00',
                'friday' => '08:00-17:00',
                'saturday' => '08:00-12:00',
                'sunday' => 'closed',
            ],
            'contact_person' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'maintenance']),
        ];
    }

    /**
     * Indicate that the warehouse is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the warehouse is in Tanzania.
     */
    public function tanzanian(): static
    {
        return $this->state(fn (array $attributes) => [
            'country' => 'Tanzania',
            'state_province' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya']),
            'city' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya']),
            'latitude' => $this->faker->latitude(-11.7, -1.0),
            'longitude' => $this->faker->longitude(29.3, 40.5),
            'phone' => '+255'.$this->faker->numerify('#########'),
        ]);
    }

    /**
     * Indicate that the warehouse operates 24/7.
     */
    public function twentyFourSeven(): static
    {
        return $this->state(fn (array $attributes) => [
            'operating_hours' => [
                'monday' => '24/7',
                'tuesday' => '24/7',
                'wednesday' => '24/7',
                'thursday' => '24/7',
                'friday' => '24/7',
                'saturday' => '24/7',
                'sunday' => '24/7',
            ],
        ]);
    }

    /**
     * Indicate that the warehouse has large capacity.
     */
    public function largeCapacity(): static
    {
        return $this->state(fn (array $attributes) => [
            'capacity_cubic_meters' => $this->faker->randomFloat(2, 10000, 50000),
        ]);
    }
}
