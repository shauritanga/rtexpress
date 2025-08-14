<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShipmentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display a listing of shipment requests (bookings).
     */
    public function index(Request $request): Response
    {
        $query = ShipmentRequest::with('processedBy');

        // Filter by date range
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->dateRange($request->date_from, $request->date_to);
        } elseif ($request->has('filter')) {
            // Predefined filters
            switch ($request->filter) {
                case 'today':
                    $query->today();
                    break;
                case 'yesterday':
                    $query->whereDate('created_at', now()->subDay());
                    break;
                case 'this_week':
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                    break;
                case 'pending':
                    $query->pending();
                    break;
                case 'done':
                    $query->done();
                    break;
            }
        } else {
            // Default to today's bookings
            $query->today();
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('pickup_location', 'like', "%{$search}%")
                  ->orWhere('delivery_location', 'like', "%{$search}%");
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get statistics
        $stats = [
            'total_today' => ShipmentRequest::today()->count(),
            'pending_today' => ShipmentRequest::today()->pending()->count(),
            'done_today' => ShipmentRequest::today()->done()->count(),
            'total_all' => ShipmentRequest::count(),
        ];

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => $request->only(['filter', 'status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Mark a booking as done.
     */
    public function markAsDone(ShipmentRequest $booking)
    {
        try {
            $booking->markAsDone(Auth::id());

            Log::info('Booking marked as done', [
                'booking_id' => $booking->id,
                'processed_by' => Auth::id(),
                'customer_name' => $booking->name,
            ]);

            return back()->with('success', 'Booking marked as done successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to mark booking as done', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to mark booking as done.']);
        }
    }

    /**
     * Delete a booking.
     */
    public function destroy(ShipmentRequest $booking)
    {
        try {
            $bookingData = [
                'id' => $booking->id,
                'name' => $booking->name,
                'email' => $booking->email,
            ];

            $booking->delete();

            Log::info('Booking deleted', [
                'booking_data' => $bookingData,
                'deleted_by' => Auth::id(),
            ]);

            return back()->with('success', 'Booking deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete booking', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete booking.']);
        }
    }

    /**
     * Show a specific booking.
     */
    public function show(ShipmentRequest $booking): Response
    {
        $booking->load('processedBy');

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking,
        ]);
    }
}
