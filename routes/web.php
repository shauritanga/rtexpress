<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Customer Registration
Route::get('/register/customer', [App\Http\Controllers\Auth\CustomerRegistrationController::class, 'show'])->name('customer.register');
Route::post('/register/customer', [App\Http\Controllers\Auth\CustomerRegistrationController::class, 'store'])->name('customer.register.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        // Route based on user role
        if ($user->hasRole('customer')) {
            return redirect('/customer/dashboard');
        }

        // Check if user has any admin role
        if ($user->hasAnyRole(['admin', 'warehouse_staff', 'billing_admin', 'customer_support'])) {
            return redirect()->route('admin.dashboard');
        }

        // If user has no roles, logout and redirect to login with error
        Auth::logout();
        return redirect()->route('login')->withErrors([
            'email' => 'Your account does not have the necessary permissions to access the system.'
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

        // Calculate today's revenue (mock for now)
        $revenueToday = \App\Models\Shipment::whereDate('created_at', today())
            ->sum('declared_value') * 0.1; // Assume 10% of declared value as revenue

        $stats = [
            'total_shipments' => $totalShipments,
            'pending_shipments' => $pendingShipments,
            'in_transit_shipments' => $inTransitShipments,
            'delivered_shipments' => $deliveredShipments,
            'overdue_shipments' => $overdueShipments,
            'active_customers' => $activeCustomers,
            'total_warehouses' => $totalWarehouses,
            'revenue_today' => $revenueToday,
        ];

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats
        ]);
    })->name('admin.dashboard');

    // Shipments routes
    Route::get('admin/shipments', function () {
        $query = \App\Models\Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse']);

        // Apply filters if provided
        if (request('search')) {
            $query->where('tracking_number', 'like', '%' . request('search') . '%')
                  ->orWhereHas('customer', function($q) {
                      $q->where('company_name', 'like', '%' . request('search') . '%');
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

});

// Admin-only routes (higher privilege required)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    // User Management (Admin only)
    Route::resource('users', UserManagementController::class);
    Route::post('users/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/assign-role', [UserManagementController::class, 'assignRole'])->name('users.assign-role');
    Route::post('users/{user}/remove-role', [UserManagementController::class, 'removeRole'])->name('users.remove-role');

    // Billing & Invoicing (Admin only)
    Route::get('billing', [\App\Http\Controllers\Admin\BillingController::class, 'index'])->name('billing.index');
    Route::get('billing/invoices', [\App\Http\Controllers\Admin\BillingController::class, 'invoices'])->name('billing.invoices');
    Route::get('billing/payments', [\App\Http\Controllers\Admin\BillingController::class, 'payments'])->name('billing.payments');

    // Invoice Management
    Route::get('invoices/create', [\App\Http\Controllers\Admin\InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('invoices', [\App\Http\Controllers\Admin\InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('invoices/{invoice}', [\App\Http\Controllers\Admin\InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Admin\InvoiceController::class, 'send'])->name('invoices.send');
    Route::post('invoices/{invoice}/mark-paid', [\App\Http\Controllers\Admin\InvoiceController::class, 'markAsPaid'])->name('invoices.mark-paid');
    Route::post('invoices/{invoice}/cancel', [\App\Http\Controllers\Admin\InvoiceController::class, 'cancel'])->name('invoices.cancel');

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
    Route::get('support/stats', [\App\Http\Controllers\Admin\SupportController::class, 'getStats'])->name('support.stats');

    // Inventory Management
    Route::get('inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/create', [\App\Http\Controllers\Admin\InventoryController::class, 'create'])->name('inventory.create');
    Route::post('inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'store'])->name('inventory.store');
    Route::get('inventory/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'show'])->name('inventory.show');
    Route::put('inventory/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'update'])->name('inventory.update');
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

    // Notification Management
    Route::get('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/create', [\App\Http\Controllers\Admin\NotificationController::class, 'create'])->name('notifications.create');
    Route::post('notifications', [\App\Http\Controllers\Admin\NotificationController::class, 'store'])->name('notifications.store');
    Route::get('notifications/{notification}', [\App\Http\Controllers\Admin\NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/send-template', [\App\Http\Controllers\Admin\NotificationController::class, 'sendFromTemplate'])->name('notifications.send-template');
    Route::post('notifications/{notification}/resend', [\App\Http\Controllers\Admin\NotificationController::class, 'resend'])->name('notifications.resend');
    Route::post('notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('notifications/process-pending', [\App\Http\Controllers\Admin\NotificationController::class, 'processPending'])->name('notifications.process-pending');
    Route::get('notifications/analytics/data', [\App\Http\Controllers\Admin\NotificationController::class, 'analytics'])->name('notifications.analytics');

    // Real-time Tracking
    Route::get('tracking/live', function () {
        return inertia('Admin/Tracking/Live');
    })->name('tracking.live');

    Route::get('tracking/dashboard', function () {
        return inertia('Admin/Tracking/Dashboard');
    })->name('tracking.dashboard');



});

// Payment webhook routes (outside auth middleware)
Route::post('webhooks/payments/{gateway}', [\App\Http\Controllers\Admin\PaymentController::class, 'handleWebhook'])->name('webhooks.payments');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

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

    // Tracking Routes (Enhanced with Scanner)
    Route::get('tracking', function () {
        return inertia('Customer/Scanner/Index');
    })->name('customer.tracking.index');

    // Communication Routes
    Route::get('communication', [App\Http\Controllers\Customer\CommunicationController::class, 'index'])->name('customer.communication.index');

    // Rates and Discounts Routes
    Route::get('rates', [App\Http\Controllers\Customer\RatesController::class, 'index'])->name('customer.rates.index');

    // Flexible Delivery Options Routes
    Route::get('delivery', [App\Http\Controllers\Customer\DeliveryController::class, 'index'])->name('customer.delivery.index');

    // Customs Management Routes
    Route::get('customs', [App\Http\Controllers\Customer\CustomsController::class, 'index'])->name('customer.customs.index');

    // Invoice Management Routes
    Route::get('invoices', [App\Http\Controllers\Customer\InvoiceController::class, 'index'])->name('customer.invoices.index');
    Route::get('invoices/{invoice}', [App\Http\Controllers\Customer\InvoiceController::class, 'show'])->name('customer.invoices.show');
    Route::get('invoices/{invoice}/download', [App\Http\Controllers\Customer\InvoiceController::class, 'download'])->name('customer.invoices.download');

    // Payment Management Routes
    Route::get('payments', [App\Http\Controllers\Customer\PaymentController::class, 'index'])->name('customer.payments.index');

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

    // Help Center Routes
    Route::get('help', [App\Http\Controllers\Customer\KnowledgeBaseController::class, 'index'])->name('customer.help.index');
    Route::get('help/search', [App\Http\Controllers\Customer\KnowledgeBaseController::class, 'search'])->name('customer.help.search');
    Route::get('help/category/{category}', [App\Http\Controllers\Customer\KnowledgeBaseController::class, 'category'])->name('customer.help.category');
    Route::get('help/article/{article}', [App\Http\Controllers\Customer\KnowledgeBaseController::class, 'show'])->name('customer.help.article');
    Route::post('help/article/{article}/helpful', [App\Http\Controllers\Customer\KnowledgeBaseController::class, 'helpful'])->name('customer.help.helpful');



    Route::get('profile', [App\Http\Controllers\Customer\ProfileController::class, 'show'])->name('customer.profile.show');
    Route::get('profile/edit', [App\Http\Controllers\Customer\ProfileController::class, 'edit'])->name('customer.profile.edit');
    Route::put('profile', [App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('profile/password', [App\Http\Controllers\Customer\ProfileController::class, 'updatePassword'])->name('customer.profile.password');
});
