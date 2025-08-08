<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $shipment;

    public $oldStatus;

    public $newStatus;

    public $location;

    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct($shipment, $oldStatus, $newStatus, $location = null)
    {
        $this->shipment = $shipment;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->location = $location;
        $this->timestamp = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('shipments'),
            new Channel('shipment.'.$this->shipment->tracking_number),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => 'shipment_status_update',
            'data' => [
                'shipment_id' => $this->shipment->id,
                'tracking_number' => $this->shipment->tracking_number,
                'old_status' => $this->oldStatus,
                'status' => $this->newStatus,
                'location' => $this->location,
                'customer' => [
                    'name' => $this->shipment->customer->company_name ?? 'Unknown',
                    'code' => $this->shipment->customer->customer_code ?? 'N/A',
                ],
                'timestamp' => $this->timestamp,
            ],
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'shipment.status.updated';
    }
}
