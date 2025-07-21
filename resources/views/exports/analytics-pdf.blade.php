<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>RT Express Analytics Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #3B82F6;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 14px;
        }
        
        .report-info {
            background: #F8FAFC;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .report-info table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .report-info td {
            padding: 5px 10px;
            border: none;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            color: #1F2937;
            font-size: 18px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .kpi-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .kpi-row {
            display: table-row;
        }
        
        .kpi-cell {
            display: table-cell;
            width: 50%;
            padding: 10px;
            vertical-align: top;
        }
        
        .kpi-card {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-left: 4px solid #3B82F6;
            padding: 15px;
            border-radius: 5px;
        }
        
        .kpi-card h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #6B7280;
        }
        
        .kpi-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 5px;
        }
        
        .kpi-card .description {
            font-size: 11px;
            color: #9CA3AF;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .data-table th {
            background: #3B82F6;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }
        
        .data-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 11px;
        }
        
        .data-table tr:nth-child(even) {
            background: #F9FAFB;
        }
        
        .status-excellent { color: #059669; font-weight: bold; }
        .status-good { color: #3B82F6; font-weight: bold; }
        .status-warning { color: #D97706; font-weight: bold; }
        .status-critical { color: #DC2626; font-weight: bold; }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RT Express Analytics Report</h1>
        <div class="subtitle">Comprehensive Performance Analysis</div>
    </div>

    <div class="report-info">
        <table>
            <tr>
                <td><strong>Report Period:</strong></td>
                <td>{{ $startDate->format('M d, Y') }} - {{ $endDate->format('M d, Y') }} ({{ $period }} days)</td>
                <td><strong>Generated:</strong></td>
                <td>{{ $generatedAt->format('M d, Y H:i:s') }}</td>
            </tr>
        </table>
    </div>

    <!-- Overview Section -->
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="kpi-grid">
            <div class="kpi-row">
                <div class="kpi-cell">
                    <div class="kpi-card">
                        <h3>Total Shipments</h3>
                        <div class="value">{{ number_format($analytics['overview']['total_shipments']) }}</div>
                        <div class="description">All shipments in period</div>
                    </div>
                </div>
                <div class="kpi-cell">
                    <div class="kpi-card">
                        <h3>Delivery Rate</h3>
                        <div class="value">{{ $analytics['overview']['delivery_rate'] }}%</div>
                        <div class="description">Successfully delivered</div>
                    </div>
                </div>
            </div>
            <div class="kpi-row">
                <div class="kpi-cell">
                    <div class="kpi-card">
                        <h3>Active Customers</h3>
                        <div class="value">{{ number_format($analytics['overview']['active_customers']) }}</div>
                        <div class="description">Customers with shipments</div>
                    </div>
                </div>
                <div class="kpi-cell">
                    <div class="kpi-card">
                        <h3>Avg Delivery Time</h3>
                        <div class="value">{{ $analytics['overview']['average_delivery_time'] }} days</div>
                        <div class="description">From pickup to delivery</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Performance Metrics -->
    <div class="section">
        <h2>Performance Metrics</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Current Value</th>
                    <th>Target</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>On-Time Delivery Rate</td>
                    <td>{{ $analytics['performanceMetrics']['on_time_delivery_rate'] }}%</td>
                    <td>95%</td>
                    <td class="status-{{ $analytics['performanceMetrics']['on_time_delivery_rate'] >= 95 ? 'excellent' : ($analytics['performanceMetrics']['on_time_delivery_rate'] >= 85 ? 'good' : 'warning') }}">
                        {{ $analytics['performanceMetrics']['on_time_delivery_rate'] >= 95 ? 'Excellent' : ($analytics['performanceMetrics']['on_time_delivery_rate'] >= 85 ? 'Good' : 'Needs Improvement') }}
                    </td>
                </tr>
                <tr>
                    <td>Average Transit Time</td>
                    <td>{{ $analytics['performanceMetrics']['average_transit_time'] }} days</td>
                    <td>3 days</td>
                    <td class="status-{{ $analytics['performanceMetrics']['average_transit_time'] <= 3 ? 'excellent' : ($analytics['performanceMetrics']['average_transit_time'] <= 5 ? 'good' : 'warning') }}">
                        {{ $analytics['performanceMetrics']['average_transit_time'] <= 3 ? 'Excellent' : ($analytics['performanceMetrics']['average_transit_time'] <= 5 ? 'Good' : 'Needs Improvement') }}
                    </td>
                </tr>
                <tr>
                    <td>Customer Satisfaction</td>
                    <td>{{ $analytics['performanceMetrics']['customer_satisfaction'] }}/5</td>
                    <td>4.5/5</td>
                    <td class="status-{{ $analytics['performanceMetrics']['customer_satisfaction'] >= 4.5 ? 'excellent' : ($analytics['performanceMetrics']['customer_satisfaction'] >= 4.0 ? 'good' : 'warning') }}">
                        {{ $analytics['performanceMetrics']['customer_satisfaction'] >= 4.5 ? 'Excellent' : ($analytics['performanceMetrics']['customer_satisfaction'] >= 4.0 ? 'Good' : 'Needs Improvement') }}
                    </td>
                </tr>
                <tr>
                    <td>Exception Rate</td>
                    <td>{{ $analytics['performanceMetrics']['exception_rate'] }}%</td>
                    <td>&lt;2%</td>
                    <td class="status-{{ $analytics['performanceMetrics']['exception_rate'] <= 2 ? 'excellent' : ($analytics['performanceMetrics']['exception_rate'] <= 5 ? 'good' : 'critical') }}">
                        {{ $analytics['performanceMetrics']['exception_rate'] <= 2 ? 'Excellent' : ($analytics['performanceMetrics']['exception_rate'] <= 5 ? 'Good' : 'Critical') }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <!-- Top Customers -->
    <div class="section">
        <h2>Top Customers by Volume</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Customer Code</th>
                    <th>Company Name</th>
                    <th>Shipments</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($analytics['topCustomers'] as $index => $customer)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $customer['customer_code'] }}</td>
                    <td>{{ $customer['company_name'] }}</td>
                    <td>{{ $customer['shipments_count'] }}</td>
                    <td>{{ ucfirst($customer['status']) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Warehouse Performance -->
    <div class="section">
        <h2>Warehouse Performance</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Warehouse</th>
                    <th>City</th>
                    <th>Total Shipments</th>
                    <th>Delivered</th>
                    <th>Delivery Rate</th>
                    <th>Capacity Utilization</th>
                </tr>
            </thead>
            <tbody>
                @foreach($analytics['warehousePerformance'] as $warehouse)
                <tr>
                    <td>{{ $warehouse['code'] }}</td>
                    <td>{{ $warehouse['city'] }}</td>
                    <td>{{ $warehouse['total_shipments'] }}</td>
                    <td>{{ $warehouse['delivered_shipments'] }}</td>
                    <td>{{ $warehouse['delivery_rate'] }}%</td>
                    <td>{{ $warehouse['capacity_utilization'] }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Service Type Distribution -->
    <div class="section">
        <h2>Service Type Distribution</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Service Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $total = collect($analytics['serviceTypeDistribution'])->sum('count');
                @endphp
                @foreach($analytics['serviceTypeDistribution'] as $service)
                <tr>
                    <td>{{ ucfirst($service['service_type']) }}</td>
                    <td>{{ $service['count'] }}</td>
                    <td>{{ $total > 0 ? round(($service['count'] / $total) * 100, 1) : 0 }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>RT Express Analytics Report | Generated on {{ $generatedAt->format('M d, Y H:i:s') }} | Confidential</p>
    </div>
</body>
</html>
