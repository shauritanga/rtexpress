<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = $this->faker->randomFloat(2, 10, 500);
        $feeRate = 0.029; // 2.9% fee
        $feeAmount = $amount * $feeRate + 0.30; // Stripe-like fee structure
        $netAmount = $amount - $feeAmount;

        return [
            'payment_number' => 'PAY-' . date('Y') . '-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'invoice_id' => Invoice::factory(),
            'customer_id' => Customer::factory(),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'type' => $this->faker->randomElement(['full', 'partial']),
            'method' => $this->faker->randomElement(['card', 'paypal', 'mpesa', 'tigopesa', 'airtelmoney', 'bank_transfer']),
            'currency' => 'USD',
            'exchange_rate' => 1.0,
            'amount' => $amount,
            'fee_amount' => $feeAmount,
            'net_amount' => $netAmount,
            'gateway' => $this->faker->randomElement(['stripe', 'paypal', 'clickpesa']),
            'gateway_transaction_id' => $this->faker->optional()->regexify('[a-z0-9]{20}'),
            'gateway_payment_id' => $this->faker->optional()->regexify('pi_[a-z0-9]{24}'),
            'gateway_response' => null,
            'payment_method_details' => null,
            'reference_number' => $this->faker->optional()->regexify('[A-Z0-9]{10}'),
            'payment_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'processed_at' => null,
            'failed_at' => null,
            'refunded_at' => null,
            'notes' => $this->faker->optional()->sentence(),
            'failure_reason' => null,
            'metadata' => null,
            'processed_by' => null,
            'created_by' => null,
            'refund_parent_id' => null,
            'refund_amount' => null,
            'refund_reason' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the payment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'processed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'gateway_transaction_id' => $this->faker->regexify('[a-z0-9]{20}'),
        ]);
    }

    /**
     * Indicate that the payment failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'failed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'failure_reason' => $this->faker->randomElement([
                'Insufficient funds',
                'Card declined',
                'Expired card',
                'Invalid card number',
                'Processing error'
            ]),
            'fee_amount' => 0,
            'net_amount' => 0,
        ]);
    }

    /**
     * Indicate that the payment is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'payment_date' => now(),
        ]);
    }

    /**
     * Indicate that the payment is refunded.
     */
    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refunded',
            'refunded_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'refund_amount' => $attributes['amount'],
            'refund_reason' => $this->faker->randomElement([
                'Customer request',
                'Duplicate payment',
                'Service not delivered',
                'Billing error'
            ]),
        ]);
    }

    /**
     * Set specific gateway.
     */
    public function gateway(string $gateway): static
    {
        $methods = [
            'stripe' => ['card', 'bank_transfer'],
            'paypal' => ['paypal', 'card'],
            'clickpesa' => ['mpesa', 'tigopesa', 'airtelmoney', 'bank_transfer'],
        ];

        return $this->state(fn (array $attributes) => [
            'gateway' => $gateway,
            'method' => $this->faker->randomElement($methods[$gateway] ?? ['card']),
        ]);
    }
}
