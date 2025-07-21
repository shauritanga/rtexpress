<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_name' => $this->faker->company(),
            'contact_person' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->optional()->secondaryAddress(),
            'city' => $this->faker->city(),
            'state_province' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'tax_number' => $this->faker->optional()->numerify('TAX-########'),
            'credit_limit' => $this->faker->randomFloat(2, 1000, 50000),
            'payment_terms' => $this->faker->randomElement(['net_15', 'net_30', 'net_60', 'net_90', 'cash_on_delivery']),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'notes' => $this->faker->optional()->paragraph(),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the customer is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the customer is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the customer is from Tanzania.
     */
    public function tanzanian(): static
    {
        return $this->state(fn (array $attributes) => [
            'country' => 'Tanzania',
            'state_province' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya']),
            'city' => $this->faker->randomElement(['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya']),
            'phone' => '+255' . $this->faker->numerify('#########'),
        ]);
    }

    /**
     * Indicate that the customer has high credit limit.
     */
    public function highCredit(): static
    {
        return $this->state(fn (array $attributes) => [
            'credit_limit' => $this->faker->randomFloat(2, 50000, 200000),
        ]);
    }
}
