<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RouteProgressUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $route;
    public $progress;
    public $currentStop;
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct($route, $progress, $currentStop = null)
    {
        $this->route = $route;
        $this->progress = $progress;
        $this->currentStop = $currentStop;
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
            new Channel('routes'),
            new Channel('route.' . $this->route->id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'type' => 'route_update',
            'data' => [
                'route_id' => $this->route->id,
                'route_number' => $this->route->route_number,
                'progress' => $this->progress,
                'current_stop' => $this->currentStop,
                'driver' => [
                    'name' => $this->route->driver->name ?? 'Unknown',
                    'id' => $this->route->driver->driver_id ?? 'N/A',
                ],
                'timestamp' => $this->timestamp,
            ]
        ];
    }

    /**
     * Get the broadcast event name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'route.progress.updated';
    }
}
