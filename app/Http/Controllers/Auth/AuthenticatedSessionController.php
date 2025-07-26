<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\OtpService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // Check if OTP is enabled for this user
        if ($user->otp_enabled && $user->phone) {
            // Don't regenerate session yet - user needs to verify OTP first
            Auth::logout(); // Logout temporarily until OTP is verified

            // Generate and send OTP
            $this->otpService->sendOtp($user, 'login');

            // Store user ID in session for OTP verification
            $request->session()->put('otp_user_id', $user->id);

            return redirect()->route('otp.verify.form');
        }

        $request->session()->regenerate();

        // Update last activity
        $user->updateLastActivity();

        // Route based on user role
        if ($user->hasRole('customer')) {
            return redirect()->intended('/customer/dashboard');
        }

        // Check if user has any admin role
        if ($user->hasAnyRole(['admin', 'warehouse_staff', 'billing_admin', 'customer_support'])) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // If user has no roles, logout and redirect to login with error
        Auth::logout();
        return redirect()->route('login')->withErrors([
            'email' => 'Your account does not have the necessary permissions to access the system.'
        ]);
    }

    /**
     * Show OTP verification form.
     */
    public function showOtpForm(Request $request): Response
    {
        $userId = $request->session()->get('otp_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/verify-otp', [
            'user' => [
                'name' => $user->name,
                'phone' => $user->phone,
            ],
            'canResend' => $this->otpService->canRequestOtp($user, 'login'),
            'cooldownSeconds' => $this->otpService->getOtpCooldownSeconds($user, 'login'),
        ]);
    }

    /**
     * Verify OTP and complete login.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp_code' => 'required|string|size:6',
        ]);

        $userId = $request->session()->get('otp_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login');
        }

        // Verify OTP
        if (!$this->otpService->verifyOtp($user, $request->otp_code, 'login')) {
            throw ValidationException::withMessages([
                'otp_code' => 'The verification code is invalid or has expired.',
            ]);
        }

        // Complete login
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();
        $request->session()->forget('otp_user_id');

        // Update last activity
        $user->updateLastActivity();

        // Route based on user role
        if ($user->hasRole('customer')) {
            return redirect()->intended('/customer/dashboard');
        }

        // Check if user has any admin role
        if ($user->hasAnyRole(['admin', 'warehouse_staff', 'billing_admin', 'customer_support'])) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // If user has no roles, logout and redirect to login with error
        Auth::logout();
        return redirect()->route('login')->withErrors([
            'email' => 'Your account does not have the necessary permissions to access the system.'
        ]);
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('otp_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$this->otpService->canRequestOtp($user, 'login')) {
            return back()->withErrors(['otp_code' => 'Please wait before requesting a new code.']);
        }

        $this->otpService->sendOtp($user, 'login');

        return back()->with('status', 'A new verification code has been sent to your phone.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
