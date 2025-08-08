<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shipment>
 */
class ShipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $estimatedDelivery = $this->faker->dateTimeBetween('now', '+7 days');

        return [
            'customer_id' => Customer::factory(),
            'origin_warehouse_id' => Warehouse::factory(),
            'destination_warehouse_id' => $this->faker->optional()->randomElement([null, Warehouse::factory()]),
            'sender_name' => $this->faker->name(),
            'sender_phone' => $this->faker->phoneNumber(),
            'sender_address' => $this->faker->address(),
            'recipient_name' => $this->faker->name(),
            'recipient_phone' => $this->faker->phoneNumber(),
            'recipient_address' => $this->faker->address(),
            'service_type' => $this->faker->randomElement(['standard', 'express', 'overnight', 'international']),
            'package_type' => $this->faker->randomElement(['document', 'package', 'pallet', 'container']),
            'weight_kg' => $this->faker->randomFloat(2, 0.1, 100),
            'dimensions_length_cm' => $this->faker->randomFloat(2, 10, 100),
            'dimensions_width_cm' => $this->faker->randomFloat(2, 10, 100),
            'dimensions_height_cm' => $this->faker->randomFloat(2, 10, 100),
            'declared_value' => $this->faker->randomFloat(2, 10, 5000),
            'insurance_value' => $this->faker->randomFloat(2, 0, 1000),
            'special_instructions' => $this->faker->optional()->sentence(),
            'status' => $this->faker->randomElement(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled']),
            'estimated_delivery_date' => $estimatedDelivery,
            'actual_delivery_date' => $this->faker->optional(0.3)->dateTimeBetween('now', '+7 days'),
            'delivery_signature' => $this->faker->optional()->name(),
            'delivery_notes' => $this->faker->optional()->sentence(),
            'created_by' => User::factory(),
            'assigned_to' => $this->faker->optional()->randomElement([null, User::factory()]),
        ];
    }

    /**
     * Indicate that the shipment is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'actual_delivery_date' => null,
            'delivery_signature' => null,
            'delivery_notes' => null,
        ]);
    }

    /**
     * Indicate that the shipment is delivered.
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'actual_delivery_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'delivery_signature' => $this->faker->name(),
            'delivery_notes' => $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the shipment is express.
     */
    public function express(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => 'express',
            'estimated_delivery_date' => $this->faker->dateTimeBetween('now', '+2 days'),
        ]);
    }

    /**
     * Indicate that the shipment is international.
     */
    public function international(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_type' => 'international',
            'estimated_delivery_date' => $this->faker->dateTimeBetween('+3 days', '+14 days'),
            'declared_value' => $this->faker->randomFloat(2, 100, 10000),
            'insurance_value' => $this->faker->randomFloat(2, 50, 2000),
        ]);
    }

    /**
     * Indicate that the shipment is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $this->faker->randomElement(['in_transit', 'out_for_delivery']),
            'estimated_delivery_date' => $this->faker->dateTimeBetween('-5 days', '-1 day'),
            'actual_delivery_date' => null,
        ]);
    }

    /**
     * Indicate that the shipment has an exception.
     */
    public function withException(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'exception',
            'special_instructions' => 'Exception: '.$this->faker->sentence(),
        ]);
    }
}
