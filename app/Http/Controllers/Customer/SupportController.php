<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Display customer support dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get customer's tickets with filtering
        $query = SupportTicket::where('customer_id', $customer->id)
            ->with(['assignedTo', 'replies'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply priority filter
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->paginate(10)->withQueryString();

        // Get support statistics
        $stats = [
            'total_tickets' => SupportTicket::where('customer_id', $customer->id)->count(),
            'open_tickets' => SupportTicket::where('customer_id', $customer->id)->whereIn('status', ['open', 'in_progress'])->count(),
            'resolved_tickets' => SupportTicket::where('customer_id', $customer->id)->where('status', 'resolved')->count(),
            'avg_satisfaction' => round(SupportTicket::where('customer_id', $customer->id)
                ->whereNotNull('satisfaction_rating')
                ->avg('satisfaction_rating') ?? 0, 1),
        ];

        return Inertia::render('Customer/Support/Index', [
            'customer' => $customer,
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    /**
     * Show the form for creating a new ticket.
     */
    public function create(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        return Inertia::render('Customer/Support/Create', [
            'customer' => $customer,
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard');
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|in:general,shipping,billing,technical,complaint,feature_request',
            'related_shipment' => 'nullable|string',
        ]);

        $ticket = SupportTicket::create([
            'customer_id' => $customer->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'category' => $validated['category'],
            'source' => 'web',
            'status' => 'open',
            'created_by' => $user->id,
        ]);

        return redirect()
            ->route('customer.support.show', $ticket)
            ->with('success', 'Support ticket created successfully. We will respond as soon as possible.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(SupportTicket $ticket): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $ticket->customer_id !== $customer->id) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        $ticket->load([
            'customer',
            'assignedTo',
            'replies' => function ($query) {
                $query->where('is_internal', false)
                      ->with(['user', 'customer'])
                      ->orderBy('created_at', 'asc');
            }
        ]);

        return Inertia::render('Customer/Support/Show', [
            'customer' => $customer,
            'ticket' => $ticket,
        ]);
    }

    /**
     * Add a reply to the ticket.
     */
    public function reply(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $ticket->customer_id !== $customer->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'customer_id' => $customer->id,
            'message' => $validated['message'],
            'type' => 'reply',
            'is_internal' => false,
        ]);

        // Update ticket status to in_progress if it was resolved
        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'in_progress']);
        }

        return redirect()
            ->route('customer.support.show', $ticket)
            ->with('success', 'Reply added successfully');
    }

    /**
     * Submit satisfaction rating for resolved ticket.
     */
    public function satisfaction(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $ticket->customer_id !== $customer->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($ticket->status !== 'resolved') {
            return response()->json(['error' => 'Can only rate resolved tickets'], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $ticket->update([
            'satisfaction_rating' => $validated['rating'],
            'satisfaction_feedback' => $validated['feedback'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback!'
        ]);
    }
}
