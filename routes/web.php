<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\WarehouseController;
use App\Http\Controllers\MarketingController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Marketing landing page
Route::get('/', [MarketingController::class, 'landing'])->name('home');
Route::get('/marketing', [MarketingController::class, 'landing'])->name('marketing.landing');

// Marketing functionality
Route::post('/marketing/shipment-request', [MarketingController::class, 'shipmentRequest'])->name('marketing.shipment.request');
Route::post('/marketing/track', [MarketingController::class, 'track'])->name('marketing.track');
Route::post('/marketing/contact', [MarketingController::class, 'marketingContact'])->name('marketing.contact');

// Standalone shipment form for WordPress integration
Route::get('shipment-form', [MarketingController::class, 'standaloneShipmentForm'])->name('shipment.form.standalone');
Route::post('shipment-form', [MarketingController::class, 'standaloneShipmentRequest'])
    ->middleware('throttle:5,1') // 5 submissions per minute
    ->name('shipment.form.submit');

// Standalone tracking form for WordPress integration
Route::get('track-shipment', [MarketingController::class, 'standaloneTrackingForm'])->name('tracking.form.standalone');
Route::post('track-shipment', [MarketingController::class, 'standaloneTrackingRequest'])
    ->middleware('throttle:10,1') // 10 tracking requests per minute
    ->name('tracking.form.submit');

// Google OAuth routes
Route::get('auth/google', [App\Http\Controllers\Auth\GoogleController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('auth/google/callback', [App\Http\Controllers\Auth\GoogleController::class, 'handleGoogleCallback'])->name('auth.google.callback');

// Customer Registration with rate limiting
Route::get('/register/customer', [App\Http\Controllers\Auth\CustomerRegistrationController::class, 'show'])->name('customer.register');
Route::post('/register/customer', [App\Http\Controllers\Auth\CustomerRegistrationController::class, 'store'])
    ->middleware('throttle:3,1') // 3 attempts per minute
    ->name('customer.register.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        // Route based on user role
        if ($user->hasRole('customer')) {
            // Check if customer account needs approval
            if ($user->customer && $user->customer->status !== 'active') {
                return redirect()->route('customer.pending-approval');
            }

            return redirect('/customer/dashboard');
        }

        // For admin users, require email verification
        if (! $user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        // Check if user has any admin role
        if ($user->hasAnyRole(['admin', 'warehouse_staff', 'billing_admin', 'customer_support'])) {
            return redirect()->route('admin.dashboard');
        }

        // If user has no roles, logout and redirect to login with error
        Auth::logout();

        return redirect()->route('login')->withErrors([
            'email' => 'Your account does not have the necessary permissions to access the system.',
        ]);
    })->name('dashboard');
});

// Admin Dashboard Route
Route::middleware(['auth', 'verified', 'role:admin,warehouse_staff'])->group(function () {
    Route::get('admin/dashboard', function () {
        $totalShipments = \App\Models\Shipment::count();
        $pendingShipments = \App\Models\Shipment::where('status', 'pending')->count();
        $inTransitShipments = \App\Models\Shipment::where('status', 'in_transit')->count();
        $deliveredShipments = \App\Models\Shipment::where('status', 'delivered')->count();
        $overdueShipments = \App\Models\Shipment::where('estimated_delivery_date', '<', now())
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->count();
        $activeCustomers = \App\Models\Customer::where('status', 'active')->count();
        $totalWarehouses = \App\Models\Warehouse::where('status', 'active')->count();

        // Calculate revenue
        $revenueToday = \App\Models\Shipment::whereDate('created_at', today())
            ->sum('declared_value') * 0.1;
        $revenueThisMonth = \App\Models\Shipment::whereMonth('created_at', now()->month)
            ->sum('declared_value') * 0.1;
        $revenueLastMonth = \App\Models\Shipment::whereMonth('created_at', now()->subMonth()->month)
            ->sum('declared_value') * 0.1;

        // Calculate real performance metrics
        $deliveredShipmentsWithDates = \App\Models\Shipment::where('status', 'delivered')
            ->whereNotNull('actual_delivery_date')
            ->whereNotNull('estimated_delivery_date')
            ->get();

        $avgDeliveryTime = 0;
        $onTimeDeliveries = 0;

        if ($deliveredShipmentsWithDates->count() > 0) {
            // Calculate average delivery time in days
            $totalDeliveryTime = $deliveredShipmentsWithDates->sum(function ($shipment) {
                return \Carbon\Carbon::parse($shipment->actual_delivery_date)
                    ->diffInDays(\Carbon\Carbon::parse($shipment->created_at));
            });
            $avgDeliveryTime = $totalDeliveryTime / $deliveredShipmentsWithDates->count();

            // Calculate on-time delivery rate
            $onTimeDeliveries = $deliveredShipmentsWithDates->filter(function ($shipment) {
                return \Carbon\Carbon::parse($shipment->actual_delivery_date)
                    ->lte(\Carbon\Carbon::parse($shipment->estimated_delivery_date));
            })->count();
        }

        $onTimeDeliveryRate = $deliveredShipmentsWithDates->count() > 0
            ? ($onTimeDeliveries / $deliveredShipmentsWithDates->count()) * 100
            : 0;

        $stats = [
            'total_shipments' => $totalShipments,
            'pending_shipments' => $pendingShipments,
            'in_transit_shipments' => $inTransitShipments,
            'delivered_shipments' => $deliveredShipments,
            'overdue_shipments' => $overdueShipments,
            'active_customers' => $activeCustomers,
            'total_warehouses' => $totalWarehouses,
            'revenue_today' => $revenueToday,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_last_month' => $revenueLastMonth,
            'avg_delivery_time' => $avgDeliveryTime,
            'on_time_delivery_rate' => $onTimeDeliveryRate,
        ];

        // Generate dashboard visualization data
        $dashboardData = [
            'daily_shipments' => collect(range(6, 0))->map(function ($daysAgo) {
                $date = now()->subDays($daysAgo);

                return [
                    'date' => $date->format('M j'),
                    'shipments' => \App\Models\Shipment::whereDate('created_at', $date)->count(),
                    'revenue' => \App\Models\Shipment::whereDate('created_at', $date)->sum('declared_value') * 0.1,
                ];
            })->values(),

            'status_distribution' => array_values(array_filter([
                ['name' => 'Delivered', 'value' => $deliveredShipments, 'color' => '#10b981'],
                ['name' => 'In Transit', 'value' => $inTransitShipments, 'color' => '#3b82f6'],
                ['name' => 'Pending', 'value' => $pendingShipments, 'color' => '#f59e0b'],
                ['name' => 'Overdue', 'value' => $overdueShipments, 'color' => '#ef4444'],
            ], fn ($item) => $item['value'] > 0)) ?: [['name' => 'No Data', 'value' => 1, 'color' => '#e5e7eb']],

            'service_type_distribution' => array_values(array_filter([
                ['name' => 'Standard', 'value' => \App\Models\Shipment::where('service_type', 'standard')->count(), 'color' => '#3b82f6'],
                ['name' => 'Express', 'value' => \App\Models\Shipment::where('service_type', 'express')->count(), 'color' => '#10b981'],
                ['name' => 'Overnight', 'value' => \App\Models\Shipment::where('service_type', 'overnight')->count(), 'color' => '#f59e0b'],
                ['name' => 'International', 'value' => \App\Models\Shipment::where('service_type', 'international')->count(), 'color' => '#ef4444'],
            ], fn ($item) => $item['value'] > 0)) ?: [['name' => 'No Data', 'value' => 1, 'color' => '#e5e7eb']],

            'warehouse_performance' => \App\Models\Warehouse::take(5)->get()->map(function ($warehouse) {
                // Count shipments originating from this warehouse only (to avoid double counting)
                $totalShipments = \App\Models\Shipment::where('origin_warehouse_id', $warehouse->id)->count();

                $deliveredShipments = \App\Models\Shipment::where('status', 'delivered')
                    ->where('origin_warehouse_id', $warehouse->id)
                    ->count();

                $efficiency = $totalShipments > 0 ? ($deliveredShipments / $totalShipments) * 100 : 0;

                return [
                    'name' => $warehouse->name,
                    'shipments' => $totalShipments,
                    'efficiency' => round($efficiency, 1),
                ];
            }),
        ];

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'dashboardData' => $dashboardData,
        ]);
    })->name('admin.dashboard');

    // Shipments routes
    Route::get('admin/shipments', function () {
        $query = \App\Models\Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse']);

        // Apply filters if provided
        if (request('search')) {
            $query->where('tracking_number', 'like', '%'.request('search').'%')
                ->orWhereHas('customer', function ($q) {
                    $q->where('company_name', 'like', '%'.request('search').'%');
                });
        }

        if (request('status')) {
            $query->where('status', request('status'));
        }

        if (request('service_type')) {
            $query->where('service_type', request('service_type'));
        }

        $shipments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate stats
        $stats = [
            'total' => \App\Models\Shipment::count(),
            'pending' => \App\Models\Shipment::where('status', 'pending')->count(),
            'in_transit' => \App\Models\Shipment::where('status', 'in_transit')->count(),
            'delivered' => \App\Models\Shipment::where('status', 'delivered')->count(),
            'overdue' => \App\Models\Shipment::where('estimated_delivery_date', '<', now())
                ->whereNotIn('status', ['delivered', 'cancelled'])
                ->count(),
            'today' => \App\Models\Shipment::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Shipments/Index', [
            'shipments' => $shipments,
            'customers' => \App\Models\Customer::select('id', 'company_name', 'customer_code')->get(),
            'warehouses' => \App\Models\Warehouse::select('id', 'name', 'code', 'city')->get(),
            'filters' => request()->only(['search', 'status', 'service_type', 'customer_id']),
            'stats' => $stats,
        ]);
    })->name('admin.shipments.index');
});

// Admin routes with role-based access control
Route::middleware(['auth', 'verified', 'role:admin,warehouse_staff'])->prefix('admin')->name('admin.')->group(function () {

    // Analytics Dashboard
    Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');

    // Export routes
    Route::prefix('export')->name('export.')->group(function () {
        Route::post('analytics', [App\Http\Controllers\Admin\ExportController::class, 'exportAnalytics'])
            ->name('analytics');
        Route::post('shipments', [App\Http\Controllers\Admin\ExportController::class, 'exportShipments'])
            ->name('shipments');
        Route::post('performance', [App\Http\Controllers\Admin\ExportController::class, 'exportPerformance'])
            ->name('performance');
    });

    // Shipment Management
    Route::resource('shipments', ShipmentController::class);
    Route::post('shipments/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.update-status');
    Route::post('shipments/{shipment}/assign', [ShipmentController::class, 'assign'])->name('shipments.assign');
    Route::get('shipments-export', [ShipmentController::class, 'export'])->name('shipments.export');

    // Customer Management
    Route::resource('customers', CustomerController::class);
    Route::post('customers/{customer}/toggle-status', [CustomerController::class, 'toggleStatus'])->name('customers.toggle-status');
    Route::post('customers/{customer}/create-user-account', [CustomerController::class, 'createUserAccount'])->name('customers.create-user-account');
    Route::post('customers/{customer}/resend-credentials', [CustomerController::class, 'resendCredentials'])->name('customers.resend-credentials');
    Route::delete('customers/{customer}/force-delete', [CustomerController::class, 'forceDestroy'])->name('customers.force-destroy');
    Route::post('customers/{customer}/restore', [CustomerController::class, 'restore'])->name('customers.restore');
    Route::get('customers-export', [CustomerController::class, 'export'])->name('customers.export');

    // Warehouse Management
    Route::resource('warehouses', WarehouseController::class);
    Route::post('warehouses/{warehouse}/toggle-status', [WarehouseController::class, 'toggleStatus'])->name('warehouses.toggle-status');
    Route::post('warehouses/calculate-distance', [WarehouseController::class, 'calculateDistance'])->name('warehouses.calculate-distance');

    // User Management
    Route::resource('users', UserManagementController::class);
    Route::post('users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/assign-role', [UserManagementController::class, 'assignRole'])->name('users.assign-role');
    Route::post('users/{user}/remove-role', [UserManagementController::class, 'removeRole'])->name('users.remove-role');

    // Notification Management (accessible to admin and warehouse_staff)
    Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/create', [\App\Http\Controllers\Admin\NotificationController::class, 'create'])->name('notifications.create');
    Route::get('notifications/recipients', [\App\Http\Controllers\Admin\NotificationController::class, 'getRecipients'])->name('notifications.recipients');
    Route::post('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('notifications.store');
    Route::get('notifications/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/send-template', [\App\Http\Controllers\Admin\NotificationController::class, 'sendFromTemplate'])->name('notifications.send-template');
    Route::post('notifications/{notification}/resend', [\App\Http\Controllers\Admin\NotificationController::class, 'resend'])->name('notifications.resend');
    Route::post('notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('notifications/{notification}/archive', [\App\Http\Controllers\Admin\NotificationController::class, 'archive'])->name('notifications.archive');
    Route::delete('notifications/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('notifications/process-pending', [\App\Http\Controllers\Admin\NotificationController::class, 'processPending'])->name('notifications.process-pending');
    Route::get('notifications/analytics/data', [\App\Http\Controllers\Admin\NotificationController::class, 'analytics'])->name('notifications.analytics');

});

// Admin-only routes (higher privilege required)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    // User Management (Admin only)
    Route::resource('users', UserManagementController::class);
    Route::post('users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/assign-role', [UserManagementController::class, 'assignRole'])->name('users.assign-role');
    Route::post('users/{user}/remove-role', [UserManagementController::class, 'removeRole'])->name('users.remove-role');

    // Invoice Management
    Route::get('invoices', [\App\Http\Controllers\Admin\BillingController::class, 'invoices'])->name('invoices.index');
    Route::get('invoices/create', [\App\Http\Controllers\Admin\InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('invoices', [\App\Http\Controllers\Admin\InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('invoices/{invoice}', [\App\Http\Controllers\Admin\InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Admin\InvoiceController::class, 'send'])->name('invoices.send');
    Route::post('invoices/{invoice}/mark-paid', [\App\Http\Controllers\Admin\InvoiceController::class, 'markAsPaid'])->name('invoices.mark-paid');
    Route::post('invoices/{invoice}/cancel', [\App\Http\Controllers\Admin\InvoiceController::class, 'cancel'])->name('invoices.cancel');

    // Invoice API endpoints
    Route::get('api/invoices/customer-shipments', [\App\Http\Controllers\Admin\InvoiceController::class, 'getCustomerShipments'])->name('invoices.customer-shipments');

    // Payment Management
    Route::get('payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/{payment}', [\App\Http\Controllers\Admin\PaymentController::class, 'show'])->name('payments.show');
    Route::post('invoices/{invoice}/process-payment', [\App\Http\Controllers\Admin\PaymentController::class, 'processPayment'])->name('invoices.process-payment');
    Route::post('invoices/{invoice}/payment-intent', [\App\Http\Controllers\Admin\PaymentController::class, 'createPaymentIntent'])->name('invoices.payment-intent');
    Route::post('payments/{payment}/refund', [\App\Http\Controllers\Admin\PaymentController::class, 'processRefund'])->name('payments.refund');
    Route::get('payments/methods/{gateway}', [\App\Http\Controllers\Admin\PaymentController::class, 'getPaymentMethods'])->name('payments.methods');
    Route::post('payments/calculate-fees', [\App\Http\Controllers\Admin\PaymentController::class, 'calculateFees'])->name('payments.calculate-fees');

    // Support Management
    Route::get('support', [\App\Http\Controllers\Admin\SupportController::class, 'index'])->name('support.index');
    Route::get('support/create', [\App\Http\Controllers\Admin\SupportController::class, 'create'])->name('support.create');
    Route::post('support', [\App\Http\Controllers\Admin\SupportController::class, 'store'])->name('support.store');
    Route::get('support/{ticket}', [\App\Http\Controllers\Admin\SupportController::class, 'show'])->name('support.show');
    Route::post('support/{ticket}/reply', [\App\Http\Controllers\Admin\SupportController::class, 'reply'])->name('support.reply');
    Route::post('support/{ticket}/assign', [\App\Http\Controllers\Admin\SupportController::class, 'assign'])->name('support.assign');
    Route::post('support/{ticket}/status', [\App\Http\Controllers\Admin\SupportController::class, 'updateStatus'])->name('support.status');
    Route::post('support/{ticket}/priority', [\App\Http\Controllers\Admin\SupportController::class, 'updatePriority'])->name('support.priority');
    Route::post('support/{ticket}/rating', [\App\Http\Controllers\Admin\SupportController::class, 'addRating'])->name('support.rating');
    Route::delete('support/{ticket}', [\App\Http\Controllers\Admin\SupportController::class, 'destroy'])->name('support.destroy');
    Route::post('support/{ticket}/archive', [\App\Http\Controllers\Admin\SupportController::class, 'archive'])->name('support.archive');
    Route::post('support/{ticket}/restore', [\App\Http\Controllers\Admin\SupportController::class, 'restore'])->name('support.restore');
    Route::post('support/bulk-action', [\App\Http\Controllers\Admin\SupportController::class, 'bulkAction'])->name('support.bulk-action');
    Route::get('support/stats', [\App\Http\Controllers\Admin\SupportController::class, 'getStats'])->name('support.stats');

    // Inventory Management
    Route::get('inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/create', [\App\Http\Controllers\Admin\InventoryController::class, 'create'])->name('inventory.create');
    Route::post('inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'store'])->name('inventory.store');
    Route::get('inventory/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'show'])->name('inventory.show');
    Route::get('inventory/{item}/edit', [\App\Http\Controllers\Admin\InventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('inventory/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('inventory/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('inventory/{item}/adjust-stock', [\App\Http\Controllers\Admin\InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock');

    // Route Management
    Route::get('routes', [\App\Http\Controllers\Admin\RouteController::class, 'index'])->name('routes.index');
    Route::get('routes/create', [\App\Http\Controllers\Admin\RouteController::class, 'create'])->name('routes.create');
    Route::post('routes', [\App\Http\Controllers\Admin\RouteController::class, 'store'])->name('routes.store');
    Route::get('routes/{route}', [\App\Http\Controllers\Admin\RouteController::class, 'show'])->name('routes.show');
    Route::post('routes/{route}/start', [\App\Http\Controllers\Admin\RouteController::class, 'start'])->name('routes.start');
    Route::post('routes/{route}/complete', [\App\Http\Controllers\Admin\RouteController::class, 'complete'])->name('routes.complete');
    Route::post('routes/{route}/optimize', [\App\Http\Controllers\Admin\RouteController::class, 'optimize'])->name('routes.optimize');
    Route::get('routes/{route}/tracking', [\App\Http\Controllers\Admin\RouteController::class, 'tracking'])->name('routes.tracking');
    Route::post('route-stops/{stop}/update', [\App\Http\Controllers\Admin\RouteController::class, 'updateStop'])->name('route-stops.update');

    // Customs & Compliance Management
    Route::get('customs', [\App\Http\Controllers\Admin\CustomsController::class, 'index'])->name('customs.index');
    Route::get('customs/create', [\App\Http\Controllers\Admin\CustomsController::class, 'create'])->name('customs.create');
    Route::post('customs', [\App\Http\Controllers\Admin\CustomsController::class, 'store'])->name('customs.store');
    Route::get('customs/{declaration}', [\App\Http\Controllers\Admin\CustomsController::class, 'show'])->name('customs.show');
    Route::post('customs/{declaration}/submit', [\App\Http\Controllers\Admin\CustomsController::class, 'submit'])->name('customs.submit');
    Route::post('customs/{declaration}/approve', [\App\Http\Controllers\Admin\CustomsController::class, 'approve'])->name('customs.approve');
    Route::post('customs/{declaration}/reject', [\App\Http\Controllers\Admin\CustomsController::class, 'reject'])->name('customs.reject');
    Route::post('customs/{declaration}/clear', [\App\Http\Controllers\Admin\CustomsController::class, 'clear'])->name('customs.clear');
    Route::post('customs/{declaration}/upload-document', [\App\Http\Controllers\Admin\CustomsController::class, 'uploadDocument'])->name('customs.upload-document');
    Route::get('customs/{declaration}/compliance-check', [\App\Http\Controllers\Admin\CustomsController::class, 'complianceCheck'])->name('customs.compliance-check');

    // Tracking
    Route::get('tracking/live', [\App\Http\Controllers\Admin\TrackingController::class, 'live'])->name('tracking.live');
    Route::post('tracking/{shipment}/update-status', [\App\Http\Controllers\Admin\TrackingController::class, 'updateStatus'])->name('tracking.update-status');
    Route::post('tracking/bulk-update', [\App\Http\Controllers\Admin\TrackingController::class, 'bulkUpdate'])->name('tracking.bulk-update');
    Route::get('tracking/{shipment}/history', [\App\Http\Controllers\Admin\TrackingController::class, 'history'])->name('tracking.history');
    Route::get('tracking/search', [\App\Http\Controllers\Admin\TrackingController::class, 'search'])->name('tracking.search');

});

// Payment webhook routes (outside auth middleware)
Route::post('webhooks/payments/{gateway}', [\App\Http\Controllers\Admin\PaymentController::class, 'handleWebhook'])->name('webhooks.payments');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Customer Pending Approval Route (no customer.auth middleware)
Route::middleware(['auth'])->group(function () {
    Route::get('customer/pending-approval', function () {
        $user = Auth::user();

        // Log access attempt for debugging
        Log::info('Pending approval page accessed', [
            'user_authenticated' => Auth::check(),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'has_customer_role' => $user ? $user->hasRole('customer') : false,
        ]);

        // Only allow customers to access this page
        if (! $user || ! $user->hasRole('customer')) {
            Log::warning('Unauthorized access to pending approval page', [
                'user_id' => $user ? $user->id : null,
                'has_customer_role' => $user ? $user->hasRole('customer') : false,
            ]);

            return redirect()->route('login');
        }

        // If customer is already active, redirect to dashboard
        if ($user->customer && $user->customer->status === 'active') {
            return redirect()->route('customer.dashboard');
        }

        return Inertia::render('customer/pending-approval', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'customer' => [
                'company_name' => $user->customer->company_name,
                'customer_code' => $user->customer->customer_code,
                'created_at' => $user->customer->created_at->toISOString(),
            ],
        ]);
    })->name('customer.pending-approval');
});

// Customer Dashboard Routes
Route::middleware(['auth', 'customer.auth'])->prefix('customer')->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Customer\DashboardController::class, 'index'])->name('customer.dashboard');
    Route::get('analytics', [App\Http\Controllers\Customer\AnalyticsController::class, 'index'])->name('customer.analytics');
    Route::get('notifications', [App\Http\Controllers\Customer\NotificationController::class, 'index'])->name('customer.notifications');

    // Notification API Routes
    Route::prefix('api/notifications')->group(function () {
        Route::get('preferences', [App\Http\Controllers\Customer\NotificationController::class, 'getPreferences']);
        Route::post('preferences', [App\Http\Controllers\Customer\NotificationController::class, 'updatePreferences']);
        Route::get('history', [App\Http\Controllers\Customer\NotificationController::class, 'getHistory']);
        Route::post('{id}/read', [App\Http\Controllers\Customer\NotificationController::class, 'markAsRead']);
    });

    // Shipment Management Routes
    Route::get('shipments', [App\Http\Controllers\Customer\ShipmentController::class, 'index'])->name('customer.shipments.index');
    Route::get('shipments/create', [App\Http\Controllers\Customer\ShipmentController::class, 'create'])->name('customer.shipments.create');
    Route::post('shipments', [App\Http\Controllers\Customer\ShipmentController::class, 'store'])->name('customer.shipments.store');
    Route::get('shipments/{shipment}', [App\Http\Controllers\Customer\ShipmentController::class, 'show'])->name('customer.shipments.show');
    Route::post('shipments/{shipment}/label', [App\Http\Controllers\Customer\ShipmentController::class, 'generateLabel'])->name('customer.shipments.label');

    // Pickup Management Routes
    Route::get('pickups', [App\Http\Controllers\Customer\PickupController::class, 'index'])->name('customer.pickups.index');
    Route::get('pickups/schedule', [App\Http\Controllers\Customer\PickupController::class, 'create'])->name('customer.pickups.create');
    Route::post('pickups', [App\Http\Controllers\Customer\PickupController::class, 'store'])->name('customer.pickups.store');

    // Returns Management Routes
    Route::get('returns', [App\Http\Controllers\Customer\ReturnController::class, 'index'])->name('customer.returns.index');
    Route::post('returns', [App\Http\Controllers\Customer\ReturnController::class, 'store'])->name('customer.returns.store');
    Route::post('returns/{return}/label', [App\Http\Controllers\Customer\ReturnController::class, 'generateLabel'])->name('customer.returns.label');

    // Tracking Routes (with integrated scanner)
    Route::get('tracking', [\App\Http\Controllers\Customer\TrackingController::class, 'index'])->name('customer.tracking.index');
    Route::get('tracking/{trackingNumber}', [\App\Http\Controllers\Customer\TrackingController::class, 'track'])->name('customer.tracking.show');
    Route::get('tracking/{trackingNumber}/updates', [\App\Http\Controllers\Customer\TrackingController::class, 'updates'])->name('customer.tracking.updates');

    // Communication Routes
    Route::get('communication', [App\Http\Controllers\Customer\CommunicationController::class, 'index'])->name('customer.communication.index');

    // Notifications Routes
    Route::get('notifications', [App\Http\Controllers\Customer\NotificationsController::class, 'index'])->name('customer.notifications.index');
    Route::post('notifications/preferences', [App\Http\Controllers\Customer\NotificationsController::class, 'updatePreferences'])->name('customer.notifications.preferences');
    Route::post('notifications/{id}/read', [App\Http\Controllers\Customer\NotificationsController::class, 'markAsRead'])->name('customer.notifications.read');
    Route::post('notifications/{id}/archive', [App\Http\Controllers\Customer\NotificationsController::class, 'archive'])->name('customer.notifications.archive');
    Route::post('notifications/read-all', [App\Http\Controllers\Customer\NotificationsController::class, 'markAllAsRead'])->name('customer.notifications.read-all');
    Route::delete('notifications/{id}', [App\Http\Controllers\Customer\NotificationsController::class, 'delete'])->name('customer.notifications.delete');
    Route::get('notifications/stats', [App\Http\Controllers\Customer\NotificationsController::class, 'getStats'])->name('customer.notifications.stats');
    Route::post('notifications/test', [App\Http\Controllers\Customer\NotificationsController::class, 'testNotification'])->name('customer.notifications.test');

    // Flexible Delivery Options Routes
    Route::get('delivery', [App\Http\Controllers\Customer\DeliveryController::class, 'index'])->name('customer.delivery.index');

    // Customs Management Routes
    Route::get('customs', [App\Http\Controllers\Customer\CustomsController::class, 'index'])->name('customer.customs.index');

    // Invoice Management Routes
    Route::get('invoices', [App\Http\Controllers\Customer\InvoiceController::class, 'index'])->name('customer.invoices.index');
    Route::get('invoices/{invoice}', [App\Http\Controllers\Customer\InvoiceController::class, 'show'])->name('customer.invoices.show');
    Route::get('invoices/{invoice}/download', [App\Http\Controllers\Customer\InvoiceController::class, 'download'])->name('customer.invoices.download');
    Route::post('invoices/pay', [App\Http\Controllers\Customer\PaymentController::class, 'processInvoicePayment'])->name('customer.invoices.pay');

    // Payment Management Routes
    Route::get('payments', [App\Http\Controllers\Customer\PaymentController::class, 'index'])->name('customer.payments.index');
    Route::get('payments/success', [App\Http\Controllers\Customer\PaymentController::class, 'paymentSuccess'])->name('customer.payments.success');
    Route::get('payments/failed', [App\Http\Controllers\Customer\PaymentController::class, 'paymentFailed'])->name('customer.payments.failed');

    // Payment API Routes
    Route::get('api/payments/invoices', [App\Http\Controllers\Customer\PaymentController::class, 'getInvoices'])->name('customer.api.payments.invoices');
    Route::get('api/payments/history', [App\Http\Controllers\Customer\PaymentController::class, 'getPaymentHistory'])->name('customer.api.payments.history');
    Route::post('api/payments/{invoice}/process', [App\Http\Controllers\Customer\PaymentController::class, 'processPayment'])->name('customer.api.payments.process');
    Route::post('api/payments/{invoice}/intent', [App\Http\Controllers\Customer\PaymentController::class, 'createPaymentIntent'])->name('customer.api.payments.intent');

    // Support Management Routes
    Route::get('support', [App\Http\Controllers\Customer\SupportController::class, 'index'])->name('customer.support.index');
    Route::get('support/create', [App\Http\Controllers\Customer\SupportController::class, 'create'])->name('customer.support.create');
    Route::post('support', [App\Http\Controllers\Customer\SupportController::class, 'store'])->name('customer.support.store');
    Route::get('support/{ticket}', [App\Http\Controllers\Customer\SupportController::class, 'show'])->name('customer.support.show');
    Route::post('support/{ticket}/reply', [App\Http\Controllers\Customer\SupportController::class, 'reply'])->name('customer.support.reply');
    Route::post('support/{ticket}/satisfaction', [App\Http\Controllers\Customer\SupportController::class, 'satisfaction'])->name('customer.support.satisfaction');

    Route::get('profile', [App\Http\Controllers\Customer\ProfileController::class, 'show'])->name('customer.profile.show');
    Route::get('profile/edit', [App\Http\Controllers\Customer\ProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::put('profile', [App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('profile/password', [App\Http\Controllers\Customer\ProfileController::class, 'updatePassword'])->name('customer.profile.password');
});
