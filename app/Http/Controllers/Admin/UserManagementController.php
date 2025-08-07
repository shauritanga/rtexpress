<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users with roles and permissions.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles'])
            ->withCount(['createdShipments', 'assignedShipments'])
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->paginate(15)->withQueryString();

        // Get filter options
        $roles = Role::select('id', 'name', 'display_name')->get();

        // Get summary statistics
        $stats = $this->getUserStats();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $roles = Role::select('id', 'name', 'display_name', 'description')->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'status' => $validated['status'],
                'email_verified_at' => now(),
            ]);

            // Assign roles
            $user->roles()->attach($validated['roles']);

            return redirect()
                ->route('admin.users.show', $user)
                ->with('success', "User {$user->name} created successfully!");

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create user. Please try again.']);
        }
    }

    /**
     * Display the specified user with activity history.
     */
    public function show(User $user)
    {
        $user->load([
            'roles.permissions',
            'createdShipments' => function ($query) {
                $query->with(['customer', 'originWarehouse'])
                      ->latest()
                      ->limit(10);
            },
            'assignedShipments' => function ($query) {
                $query->with(['customer', 'originWarehouse'])
                      ->latest()
                      ->limit(10);
            }
        ]);

        // Get user statistics
        $userStats = [
            'total_created_shipments' => $user->createdShipments()->count(),
            'total_assigned_shipments' => $user->assignedShipments()->count(),
            'active_assignments' => $user->assignedShipments()->active()->count(),
            'completed_assignments' => $user->assignedShipments()->byStatus('delivered')->count(),
            'last_login' => $user->last_login_at,
            'account_age_days' => $user->created_at->diffInDays(now()),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'userStats' => $userStats,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::select('id', 'name', 'display_name', 'description')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,id',
        ]);

        try {
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'status' => $validated['status'],
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Sync roles
            $user->roles()->sync($validated['roles']);

            return redirect()
                ->route('admin.users.show', $user)
                ->with('success', "User {$user->name} updated successfully!");

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update user. Please try again.']);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        try {
            // Prevent deletion of users with active assignments
            if ($user->assignedShipments()->active()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete user with active shipment assignments.']);
            }

            // Check for shipments created by this user
            if ($user->createdShipments()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete user who has created shipments. Please reassign these shipments first.']);
            }

            // Prevent self-deletion
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'You cannot delete your own account.']);
            }

            // Prevent deletion of the last admin user
            if ($user->hasRole('admin')) {
                $adminCount = User::whereHas('roles', function ($query) {
                    $query->where('name', 'admin');
                })->count();

                if ($adminCount <= 1) {
                    return back()->withErrors(['error' => 'Cannot delete the last admin user. At least one admin must remain.']);
                }
            }

            $userName = $user->name;

            try {
                $user->delete();
            } catch (\Illuminate\Database\QueryException $e) {
                // Handle foreign key constraint violations
                if ($e->getCode() === '23000') {
                    return back()->withErrors(['error' => 'Cannot delete user due to related records (payments, notifications, etc.). Please contact system administrator.']);
                }
                throw $e; // Re-throw if it's a different database error
            }

            return redirect()
                ->route('admin.users.index')
                ->with('success', "User {$userName} deleted successfully!");

        } catch (\Exception $e) {
            \Log::error('User deletion failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'deleted_by' => auth()->id(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete user. Please try again.']);
        }
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(User $user)
    {
        try {
            // Prevent self-suspension
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'You cannot change your own status.']);
            }

            $newStatus = $user->status === 'active' ? 'inactive' : 'active';
            $user->update(['status' => $newStatus]);

            $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';

            return back()->with('success', "User {$user->name} {$statusText} successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update user status. Please try again.']);
        }
    }

    /**
     * Assign role to user.
     */
    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            if (!$user->hasRole($validated['role_id'])) {
                $user->roles()->attach($validated['role_id']);
                $role = Role::find($validated['role_id']);

                return back()->with('success', "Role '{$role->display_name}' assigned to {$user->name} successfully!");
            }

            return back()->withErrors(['error' => 'User already has this role.']);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to assign role. Please try again.']);
        }
    }

    /**
     * Remove role from user.
     */
    public function removeRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            // Ensure user has at least one role
            if ($user->roles()->count() <= 1) {
                return back()->withErrors(['error' => 'User must have at least one role.']);
            }

            $user->roles()->detach($validated['role_id']);
            $role = Role::find($validated['role_id']);

            return back()->with('success', "Role '{$role->display_name}' removed from {$user->name} successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove role. Please try again.']);
        }
    }

    /**
     * Get user statistics for dashboard.
     */
    private function getUserStats(): array
    {
        try {
            return [
                'total' => User::count(),
                'active' => User::active()->count(),
                'inactive' => User::where('status', 'inactive')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'online_now' => User::where('last_login_at', '>=', now()->subMinutes(15))->count(),
                'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
            ];
        } catch (\Exception $e) {
            // Return default stats if there's an error
            \Log::error('Error getting user stats: ' . $e->getMessage());
            return [
                'total' => 0,
                'active' => 0,
                'inactive' => 0,
                'suspended' => 0,
                'online_now' => 0,
                'new_this_month' => 0,
            ];
        }
    }
}
