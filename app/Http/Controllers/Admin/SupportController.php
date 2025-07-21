<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupportController extends Controller
{
    /**
     * Display support dashboard.
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with(['customer', 'assignedTo', 'createdBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'open') {
                $query->open();
            } elseif ($request->status === 'closed') {
                $query->closed();
            } elseif ($request->status === 'overdue') {
                $query->overdue();
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('assigned_to')) {
            if ($request->assigned_to === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $request->assigned_to);
            }
        }

        $tickets = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_tickets' => SupportTicket::count(),
            'open_tickets' => SupportTicket::open()->count(),
            'overdue_tickets' => SupportTicket::overdue()->count(),
            'resolved_today' => SupportTicket::whereDate('resolved_at', today())->count(),
            'avg_response_time' => $this->calculateAverageResponseTime(),
            'avg_resolution_time' => $this->calculateAverageResolutionTime(),
        ];

        // Get agents for assignment
        $agents = User::where('role', 'admin')
            ->orWhere('role', 'support_agent')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Support/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'agents' => $agents,
            'filters' => $request->only(['search', 'status', 'priority', 'category', 'assigned_to']),
        ]);
    }

    /**
     * Show ticket details.
     */
    public function show(SupportTicket $ticket)
    {
        $ticket->load([
            'customer',
            'assignedTo',
            'createdBy',
            'replies' => function ($query) {
                $query->with(['user', 'customer'])->orderBy('created_at', 'asc');
            }
        ]);

        // Get agents for assignment
        $agents = User::where('role', 'admin')
            ->orWhere('role', 'support_agent')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket,
            'agents' => $agents,
        ]);
    }

    /**
     * Create new ticket.
     */
    public function create()
    {
        $customers = Customer::select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Support/Create', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store new ticket.
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|in:general,shipping,billing,technical,complaint,feature_request',
            'source' => 'string|in:web,email,phone,chat',
        ]);

        $ticket = SupportTicket::create([
            'customer_id' => $request->customer_id,
            'subject' => $request->subject,
            'description' => $request->description,
            'priority' => $request->priority,
            'category' => $request->category,
            'source' => $request->source ?? 'web',
            'created_by' => auth()->id(),
            'status' => 'open',
        ]);

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Support ticket created successfully');
    }

    /**
     * Reply to ticket.
     */
    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'message' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
            'type' => 'reply',
            'is_internal' => $request->is_internal ?? false,
        ]);

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Reply added successfully');
    }

    /**
     * Assign ticket to agent.
     */
    public function assign(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ticket->update([
            'assigned_to' => $request->assigned_to,
        ]);

        // Add system note
        if ($request->assigned_to) {
            $agent = User::find($request->assigned_to);
            TicketReply::create([
                'ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'message' => "Ticket assigned to {$agent->name}",
                'type' => 'status_change',
                'is_internal' => true,
            ]);
        } else {
            TicketReply::create([
                'ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'message' => "Ticket unassigned",
                'type' => 'status_change',
                'is_internal' => true,
            ]);
        }

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Ticket assignment updated');
    }

    /**
     * Update ticket status.
     */
    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,waiting_customer,resolved,closed',
        ]);

        $oldStatus = $ticket->status;
        $newStatus = $request->status;

        $ticket->update([
            'status' => $newStatus,
            'resolved_at' => $newStatus === 'resolved' ? now() : null,
            'closed_at' => $newStatus === 'closed' ? now() : null,
        ]);

        // Add system note
        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => "Status changed from {$oldStatus} to {$newStatus}",
            'type' => 'status_change',
            'is_internal' => true,
        ]);

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Ticket status updated');
    }

    /**
     * Update ticket priority.
     */
    public function updatePriority(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $oldPriority = $ticket->priority;
        $newPriority = $request->priority;

        $ticket->update(['priority' => $newPriority]);

        // Add system note
        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => "Priority changed from {$oldPriority} to {$newPriority}",
            'type' => 'status_change',
            'is_internal' => true,
        ]);

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Ticket priority updated');
    }

    /**
     * Add satisfaction rating.
     */
    public function addRating(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $ticket->update([
            'satisfaction_rating' => $request->rating,
            'satisfaction_feedback' => $request->feedback,
        ]);

        return redirect()
            ->route('admin.support.show', $ticket)
            ->with('success', 'Customer satisfaction rating added');
    }

    /**
     * Get support statistics for dashboard.
     */
    public function getStats()
    {
        $stats = [
            'total_tickets' => SupportTicket::count(),
            'open_tickets' => SupportTicket::open()->count(),
            'overdue_tickets' => SupportTicket::overdue()->count(),
            'resolved_today' => SupportTicket::whereDate('resolved_at', today())->count(),
            'avg_response_time' => $this->calculateAverageResponseTime(),
            'avg_resolution_time' => $this->calculateAverageResolutionTime(),
            'satisfaction_avg' => round(SupportTicket::whereNotNull('satisfaction_rating')
                ->avg('satisfaction_rating') ?? 0, 1),
        ];

        return response()->json($stats);
    }

    /**
     * Calculate average response time in hours.
     */
    private function calculateAverageResponseTime(): float
    {
        $tickets = SupportTicket::whereNotNull('first_response_at')
            ->select('created_at', 'first_response_at')
            ->get();

        if ($tickets->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($tickets as $ticket) {
            $totalHours += $ticket->created_at->diffInHours($ticket->first_response_at);
        }

        return round($totalHours / $tickets->count(), 1);
    }

    /**
     * Calculate average resolution time in hours.
     */
    private function calculateAverageResolutionTime(): float
    {
        $tickets = SupportTicket::whereNotNull('resolved_at')
            ->select('created_at', 'resolved_at')
            ->get();

        if ($tickets->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($tickets as $ticket) {
            $totalHours += $ticket->created_at->diffInHours($ticket->resolved_at);
        }

        return round($totalHours / $tickets->count(), 1);
    }
}
