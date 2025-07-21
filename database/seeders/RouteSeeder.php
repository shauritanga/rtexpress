<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Driver;
use App\Models\DeliveryRoute;
use App\Models\RouteStop;
use App\Models\Warehouse;
use App\Models\Shipment;
use App\Models\User;

class RouteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = Warehouse::all();
        $users = User::all();
        $shipments = Shipment::all();

        if ($warehouses->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No warehouses or users found. Please seed warehouses and users first.');
            return;
        }

        // Create sample drivers first
        $drivers = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@rtexpress.com',
                'phone' => '+1-555-0101',
                'license_number' => 'DL123456789',
                'license_expiry' => now()->addYears(2),
                'address' => '123 Driver St, City, State 12345',
                'date_of_birth' => now()->subYears(35),
                'vehicle_type' => 'Van',
                'vehicle_plate' => 'RT-001',
                'vehicle_capacity' => 1500.00,
                'emergency_contact' => [
                    'name' => 'Jane Smith',
                    'phone' => '+1-555-0102',
                    'relationship' => 'Spouse'
                ],
                'working_hours' => [
                    'monday' => ['start' => '08:00', 'end' => '17:00'],
                    'tuesday' => ['start' => '08:00', 'end' => '17:00'],
                    'wednesday' => ['start' => '08:00', 'end' => '17:00'],
                    'thursday' => ['start' => '08:00', 'end' => '17:00'],
                    'friday' => ['start' => '08:00', 'end' => '17:00'],
                    'saturday' => ['start' => '09:00', 'end' => '15:00'],
                    'sunday' => ['start' => '10:00', 'end' => '14:00'],
                ],
                'current_latitude' => 40.7128,
                'current_longitude' => -74.0060,
                'last_location_update' => now()->subMinutes(5),
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.garcia@rtexpress.com',
                'phone' => '+1-555-0201',
                'license_number' => 'DL987654321',
                'license_expiry' => now()->addYears(3),
                'address' => '456 Transport Ave, City, State 12345',
                'date_of_birth' => now()->subYears(28),
                'vehicle_type' => 'Truck',
                'vehicle_plate' => 'RT-002',
                'vehicle_capacity' => 3000.00,
                'emergency_contact' => [
                    'name' => 'Carlos Garcia',
                    'phone' => '+1-555-0202',
                    'relationship' => 'Brother'
                ],
                'working_hours' => [
                    'monday' => ['start' => '07:00', 'end' => '16:00'],
                    'tuesday' => ['start' => '07:00', 'end' => '16:00'],
                    'wednesday' => ['start' => '07:00', 'end' => '16:00'],
                    'thursday' => ['start' => '07:00', 'end' => '16:00'],
                    'friday' => ['start' => '07:00', 'end' => '16:00'],
                    'saturday' => ['start' => '08:00', 'end' => '14:00'],
                ],
                'current_latitude' => 40.7589,
                'current_longitude' => -73.9851,
                'last_location_update' => now()->subMinutes(2),
            ],
            [
                'name' => 'David Johnson',
                'email' => 'david.johnson@rtexpress.com',
                'phone' => '+1-555-0301',
                'license_number' => 'DL456789123',
                'license_expiry' => now()->addYears(1),
                'address' => '789 Delivery Rd, City, State 12345',
                'date_of_birth' => now()->subYears(42),
                'vehicle_type' => 'Van',
                'vehicle_plate' => 'RT-003',
                'vehicle_capacity' => 1200.00,
                'emergency_contact' => [
                    'name' => 'Sarah Johnson',
                    'phone' => '+1-555-0302',
                    'relationship' => 'Wife'
                ],
                'working_hours' => [
                    'monday' => ['start' => '09:00', 'end' => '18:00'],
                    'tuesday' => ['start' => '09:00', 'end' => '18:00'],
                    'wednesday' => ['start' => '09:00', 'end' => '18:00'],
                    'thursday' => ['start' => '09:00', 'end' => '18:00'],
                    'friday' => ['start' => '09:00', 'end' => '18:00'],
                ],
                'current_latitude' => 40.6892,
                'current_longitude' => -74.0445,
                'last_location_update' => now()->subMinutes(8),
            ],
        ];

        $createdDrivers = [];
        foreach ($drivers as $driverData) {
            $createdDrivers[] = Driver::create($driverData);
        }

        // Create sample delivery routes
        $routes = [
            [
                'driver' => $createdDrivers[0],
                'delivery_date' => today(),
                'planned_start_time' => '08:00',
                'planned_end_time' => '16:00',
                'status' => 'in_progress',
                'actual_start_time' => today()->setTime(8, 15),
                'stops' => [
                    [
                        'customer_name' => 'ABC Electronics',
                        'address' => '100 Business Blvd, Manhattan, NY 10001',
                        'latitude' => 40.7505,
                        'longitude' => -73.9934,
                        'type' => 'delivery',
                        'priority' => 'high',
                        'status' => 'completed',
                        'planned_arrival_time' => '09:00',
                        'planned_departure_time' => '09:20',
                        'actual_arrival_time' => today()->setTime(9, 5),
                        'actual_departure_time' => today()->setTime(9, 18),
                    ],
                    [
                        'customer_name' => 'Tech Solutions Inc',
                        'address' => '250 Innovation Dr, Brooklyn, NY 11201',
                        'latitude' => 40.6892,
                        'longitude' => -73.9442,
                        'type' => 'delivery',
                        'priority' => 'medium',
                        'status' => 'in_transit',
                        'planned_arrival_time' => '10:30',
                        'planned_departure_time' => '10:50',
                    ],
                    [
                        'customer_name' => 'Global Imports',
                        'address' => '500 Trade Center, Queens, NY 11101',
                        'latitude' => 40.7282,
                        'longitude' => -73.9942,
                        'type' => 'pickup',
                        'priority' => 'medium',
                        'status' => 'pending',
                        'planned_arrival_time' => '12:00',
                        'planned_departure_time' => '12:30',
                    ],
                ],
            ],
            [
                'driver' => $createdDrivers[1],
                'delivery_date' => today(),
                'planned_start_time' => '07:00',
                'planned_end_time' => '15:00',
                'status' => 'planned',
                'stops' => [
                    [
                        'customer_name' => 'Metro Supplies',
                        'address' => '75 Industrial Way, Bronx, NY 10451',
                        'latitude' => 40.8176,
                        'longitude' => -73.9182,
                        'type' => 'delivery',
                        'priority' => 'urgent',
                        'status' => 'pending',
                        'planned_arrival_time' => '08:00',
                        'planned_departure_time' => '08:30',
                    ],
                    [
                        'customer_name' => 'City Hardware',
                        'address' => '300 Construction Ave, Staten Island, NY 10301',
                        'latitude' => 40.6437,
                        'longitude' => -74.0834,
                        'type' => 'delivery',
                        'priority' => 'high',
                        'status' => 'pending',
                        'planned_arrival_time' => '10:00',
                        'planned_departure_time' => '10:25',
                    ],
                ],
            ],
            [
                'driver' => $createdDrivers[2],
                'delivery_date' => today()->subDay(),
                'planned_start_time' => '09:00',
                'planned_end_time' => '17:00',
                'status' => 'completed',
                'actual_start_time' => today()->subDay()->setTime(9, 10),
                'actual_end_time' => today()->subDay()->setTime(16, 45),
                'stops' => [
                    [
                        'customer_name' => 'Fashion Forward',
                        'address' => '150 Style St, Manhattan, NY 10002',
                        'latitude' => 40.7223,
                        'longitude' => -73.9878,
                        'type' => 'delivery',
                        'priority' => 'medium',
                        'status' => 'completed',
                        'planned_arrival_time' => '10:00',
                        'planned_departure_time' => '10:15',
                        'actual_arrival_time' => today()->subDay()->setTime(10, 5),
                        'actual_departure_time' => today()->subDay()->setTime(10, 12),
                    ],
                    [
                        'customer_name' => 'Home Essentials',
                        'address' => '400 Comfort Blvd, Brooklyn, NY 11215',
                        'latitude' => 40.6650,
                        'longitude' => -73.9776,
                        'type' => 'delivery',
                        'priority' => 'low',
                        'status' => 'completed',
                        'planned_arrival_time' => '11:30',
                        'planned_departure_time' => '11:50',
                        'actual_arrival_time' => today()->subDay()->setTime(11, 35),
                        'actual_departure_time' => today()->subDay()->setTime(11, 48),
                    ],
                ],
            ],
        ];

        foreach ($routes as $routeData) {
            $route = DeliveryRoute::create([
                'driver_id' => $routeData['driver']->id,
                'warehouse_id' => $warehouses->first()->id,
                'delivery_date' => $routeData['delivery_date'],
                'planned_start_time' => $routeData['planned_start_time'],
                'planned_end_time' => $routeData['planned_end_time'],
                'status' => $routeData['status'],
                'actual_start_time' => $routeData['actual_start_time'] ?? null,
                'actual_end_time' => $routeData['actual_end_time'] ?? null,
                'total_stops' => count($routeData['stops']),
                'completed_stops' => collect($routeData['stops'])->where('status', 'completed')->count(),
                'total_distance' => rand(25, 150) / 10, // Random distance between 2.5 and 15 km
                'estimated_duration' => count($routeData['stops']) * 0.75, // 45 minutes per stop
                'created_by' => $users->first()->id,
            ]);

            foreach ($routeData['stops'] as $index => $stopData) {
                RouteStop::create([
                    'delivery_route_id' => $route->id,
                    'shipment_id' => $shipments->random()->id ?? 1,
                    'stop_order' => $index + 1,
                    'type' => $stopData['type'],
                    'status' => $stopData['status'],
                    'customer_name' => $stopData['customer_name'],
                    'address' => $stopData['address'],
                    'latitude' => $stopData['latitude'],
                    'longitude' => $stopData['longitude'],
                    'planned_arrival_time' => $stopData['planned_arrival_time'],
                    'planned_departure_time' => $stopData['planned_departure_time'],
                    'actual_arrival_time' => $stopData['actual_arrival_time'] ?? null,
                    'actual_departure_time' => $stopData['actual_departure_time'] ?? null,
                    'priority' => $stopData['priority'],
                    'estimated_duration' => 20, // 20 minutes per stop
                    'requires_signature' => rand(0, 1) === 1,
                    'is_fragile' => rand(0, 1) === 1,
                ]);
            }
        }

        $this->command->info('Routes and drivers seeded successfully!');
    }
}
