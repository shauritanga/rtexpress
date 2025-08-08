<?php

namespace App\Http\Controllers\Admin;

use App\Events\RouteProgressUpdated;
use App\Events\ShipmentStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\Shipment;
use Illuminate\Http\Request;

class WebSocketController extends Controller
{
    /**
     * Trigger a test shipment status update
     */
    public function testShipmentUpdate(Request $request)
    {
        $shipment = Shipment::first();

        if (! $shipment) {
            return response()->json(['error' => 'No shipments found'], 404);
        }

        $oldStatus = $shipment->status;
        $newStatus = $request->input('status', 'in_transit');
        $location = $request->input('location', 'Test Location');

        // Update the shipment
        $shipment->update(['status' => $newStatus]);

        // Broadcast the event
        broadcast(new ShipmentStatusUpdated($shipment, $oldStatus, $newStatus, $location));

        return response()->json([
            'message' => 'Shipment status updated and broadcasted',
            'shipment' => $shipment->tracking_number,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'location' => $location,
        ]);
    }

    /**
     * Trigger a test route progress update
     */
    public function testRouteUpdate(Request $request)
    {
        $route = Route::first();

        if (! $route) {
            return response()->json(['error' => 'No routes found'], 404);
        }

        $progress = $request->input('progress', rand(10, 90));
        $currentStop = $request->input('current_stop', 'Test Stop');

        // Broadcast the event
        broadcast(new RouteProgressUpdated($route, $progress, $currentStop));

        return response()->json([
            'message' => 'Route progress updated and broadcasted',
            'route' => $route->route_number,
            'progress' => $progress,
            'current_stop' => $currentStop,
        ]);
    }

    /**
     * Send a custom real-time event
     */
    public function sendCustomEvent(Request $request)
    {
        $eventType = $request->input('type', 'custom_event');
        $message = $request->input('message', 'Custom real-time message');
        $data = $request->input('data', []);

        $eventData = [
            'type' => $eventType,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString(),
        ];

        // Broadcast to general channel
        broadcast(new \Illuminate\Broadcasting\BroadcastEvent(
            new \Illuminate\Broadcasting\Channel('general'),
            $eventData
        ));

        return response()->json([
            'message' => 'Custom event broadcasted',
            'event' => $eventData,
        ]);
    }

    /**
     * Get WebSocket connection info
     */
    public function connectionInfo()
    {
        return response()->json([
            'websocket_url' => config('broadcasting.connections.reverb.host', 'localhost').':'.config('broadcasting.connections.reverb.port', 8080),
            'app_key' => config('broadcasting.connections.reverb.key'),
            'channels' => [
                'shipments' => 'All shipment updates',
                'routes' => 'All route updates',
                'general' => 'General notifications',
                'shipment.{tracking_number}' => 'Specific shipment updates',
                'route.{route_id}' => 'Specific route updates',
            ],
            'events' => [
                'shipment.status.updated' => 'Shipment status changes',
                'route.progress.updated' => 'Route progress updates',
            ],
        ]);
    }
}
