<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public tracking routes (no authentication required)
Route::get('/tracking/{trackingNumber}', [App\Http\Controllers\Customer\TrackingController::class, 'track']);
Route::get('/tracking/{trackingNumber}/updates', [App\Http\Controllers\Customer\TrackingController::class, 'updates']);

// Scanner API routes (require authentication)
Route::middleware('auth')->group(function () {
    // Admin scanner routes
    Route::prefix('admin')->middleware('role:admin,warehouse_staff')->group(function () {
        Route::get('/shipments/lookup/{trackingNumber}', [App\Http\Controllers\Admin\ScannerController::class, 'lookupShipment']);
        Route::patch('/shipments/{trackingNumber}/status', [App\Http\Controllers\Admin\ScannerController::class, 'updateStatus']);
    });

    // Customer scanner routes
    Route::prefix('customer')->group(function () {
        Route::get('/tracking/{trackingNumber}', [App\Http\Controllers\Customer\ScannerController::class, 'trackPackage']);
    });
});

// Communication routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::post('/communication/messages', [App\Http\Controllers\Customer\CommunicationController::class, 'sendMessage']);
    Route::post('/communication/instructions', [App\Http\Controllers\Customer\CommunicationController::class, 'updateInstructions']);
    Route::get('/communication/{trackingNumber}/messages', [App\Http\Controllers\Customer\CommunicationController::class, 'getMessages']);

    // Rates and discounts routes
    Route::post('/rates/calculate', [App\Http\Controllers\Customer\RatesController::class, 'calculate']);
    Route::post('/rates/apply-discount', [App\Http\Controllers\Customer\RatesController::class, 'applyDiscount']);
    Route::post('/rates/optimizations', [App\Http\Controllers\Customer\RatesController::class, 'getOptimizations']);

    // Flexible delivery options routes
    Route::get('/delivery/time-slots', [App\Http\Controllers\Customer\DeliveryController::class, 'getTimeSlots']);
    Route::get('/delivery/pickup-locations', [App\Http\Controllers\Customer\DeliveryController::class, 'getPickupLocations']);
    Route::post('/delivery/preferences', [App\Http\Controllers\Customer\DeliveryController::class, 'savePreferences']);
    Route::post('/delivery/apply-options', [App\Http\Controllers\Customer\DeliveryController::class, 'applyDeliveryOptions']);

    // Customs management routes
    Route::post('/customs/calculate-duty-tax', [App\Http\Controllers\Customer\CustomsController::class, 'calculateDutyTax']);
    Route::post('/customs/check-compliance', [App\Http\Controllers\Customer\CustomsController::class, 'checkCompliance']);
    Route::post('/customs/save-document', [App\Http\Controllers\Customer\CustomsController::class, 'saveDocument']);
    Route::post('/customs/generate-document', [App\Http\Controllers\Customer\CustomsController::class, 'generateDocument']);

    // Payment management routes
    Route::get('/payments/methods', [App\Http\Controllers\Customer\PaymentController::class, 'getPaymentMethods']);
    Route::post('/payments/methods', [App\Http\Controllers\Customer\PaymentController::class, 'addPaymentMethod']);
    Route::delete('/payments/methods/{methodId}', [App\Http\Controllers\Customer\PaymentController::class, 'removePaymentMethod']);
    Route::put('/payments/methods/{methodId}/default', [App\Http\Controllers\Customer\PaymentController::class, 'setDefaultPaymentMethod']);
    Route::get('/payments/invoices', [App\Http\Controllers\Customer\PaymentController::class, 'getInvoices']);
    Route::get('/payments/history', [App\Http\Controllers\Customer\PaymentController::class, 'getPaymentHistory']);
    Route::post('/payments/invoices/{invoice}/pay', [App\Http\Controllers\Customer\PaymentController::class, 'processPayment']);
    Route::post('/payments/invoices/{invoice}/payment-intent', [App\Http\Controllers\Customer\PaymentController::class, 'createPaymentIntent']);
});
