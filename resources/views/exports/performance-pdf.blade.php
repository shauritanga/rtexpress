<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>RT Express Performance Report</title>
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
            border-bottom: 2px solid #8B5CF6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #8B5CF6;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 14px;
        }
        
        .report-info {
            background: #FAF5FF;
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
        
        .metrics-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .metrics-row {
            display: table-row;
        }
        
        .metrics-cell {
            display: table-cell;
            width: 25%;
            padding: 10px;
            vertical-align: top;
        }
        
        .metric-card {
            background: #F8FAFC;
            border: 1px solid #E5E7EB;
            border-left: 4px solid #8B5CF6;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        
        .metric-card h3 {
            margin: 0 0 5px 0;
            font-size: 12px;
            color: #6B7280;
        }
        
        .metric-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 5px;
        }
        
        .metric-card .description {
            font-size: 10px;
            color: #9CA3AF;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .data-table th {
            background: #8B5CF6;
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
        
        .on-time { color: #059669; font-weight: bold; }
        .late { color: #DC2626; font-weight: bold; }
        .excellent { color: #059669; font-weight: bold; }
        .good { color: #3B82F6; font-weight: bold; }
        .warning { color: #D97706; font-weight: bold; }
        
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
    </style>
</head>
<body>
    <div class="header">
        <h1>RT Express Performance Report</h1>
        <div class="subtitle">Delivery Performance Analysis</div>
    </div>

    <div class="report-info">
        <table>
            <tr>
                <td><strong>Report Period:</strong></td>
                <td>{{ $startDate->format('M d, Y') }} - {{ $endDate->format('M d, Y') }}</td>
                <td><strong>Generated:</strong></td>
                <td>{{ $generatedAt->format('M d, Y H:i:s') }}</td>
            </tr>
            <tr>
                <td><strong>Total Delivered:</strong></td>
                <td>{{ $shipments->count() }} shipments</td>
                <td><strong>Report Type:</strong></td>
                <td>Performance Analysis</td>
            </tr>
        </table>
    </div>

    <!-- Performance Metrics -->
    <div class="section">
        <h2>Key Performance Indicators</h2>
        <div class="metrics-grid">
            <div class="metrics-row">
                <div class="metrics-cell">
                    <div class="metric-card">
                        <h3>On-Time Deliveries</h3>
                        <div class="value">{{ $shipments->filter(function($s) { return $s->actual_delivery_date <= $s->estimated_delivery_date; })->count() }}</div>
                        <div class="description">Out of {{ $shipments->count() }}</div>
                    </div>
                </div>
                <div class="metrics-cell">
                    <div class="metric-card">
                        <h3>On-Time Rate</h3>
                        <div class="value">
                            @php
                                $onTimeCount = $shipments->filter(function($s) { return $s->actual_delivery_date <= $s->estimated_delivery_date; })->count();
                                $onTimeRate = $shipments->count() > 0 ? round(($onTimeCount / $shipments->count()) * 100, 1) : 0;
                            @endphp
                            {{ $onTimeRate }}%
                        </div>
                        <div class="description">Target: 95%</div>
                    </div>
                </div>
                <div class="metrics-cell">
                    <div class="metric-card">
                        <h3>Avg Transit Time</h3>
                        <div class="value">
                            @php
                                $avgDays = $shipments->avg(function($s) { return $s->created_at->diffInDays($s->actual_delivery_date); });
                            @endphp
                            {{ round($avgDays, 1) }} days
                        </div>
                        <div class="description">Target: 3 days</div>
                    </div>
                </div>
                <div class="metrics-cell">
                    <div class="metric-card">
                        <h3>Performance Score</h3>
                        <div class="value">
                            @php
                                $score = $onTimeRate >= 95 ? 'A+' : ($onTimeRate >= 85 ? 'A' : ($onTimeRate >= 75 ? 'B' : 'C'));
                            @endphp
                            {{ $score }}
                        </div>
                        <div class="description">Overall Grade</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Detailed Performance Data -->
    <div class="section">
        <h2>Delivery Performance Details</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Tracking Number</th>
                    <th>Customer</th>
                    <th>Service Type</th>
                    <th>Created Date</th>
                    <th>Estimated Delivery</th>
                    <th>Actual Delivery</th>
                    <th>Days to Deliver</th>
                    <th>Status</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                @foreach($shipments->take(20) as $shipment)
                @php
                    $daysToDeliver = $shipment->created_at->diffInDays($shipment->actual_delivery_date);
                    $onTime = $shipment->actual_delivery_date <= $shipment->estimated_delivery_date;
                    $onTimeStatus = $onTime ? 'On Time' : 'Late';
                    $performanceScore = 100;
                    if (!$onTime && $shipment->estimated_delivery_date) {
                        $daysLate = $shipment->actual_delivery_date->diffInDays($shipment->estimated_delivery_date);
                        $performanceScore = max(0, 100 - ($daysLate * 10));
                    }
                @endphp
                <tr>
                    <td>{{ $shipment->tracking_number }}</td>
                    <td>{{ $shipment->customer->company_name ?? 'N/A' }}</td>
                    <td>{{ ucfirst($shipment->service_type) }}</td>
                    <td>{{ $shipment->created_at->format('M d, Y') }}</td>
                    <td>{{ $shipment->estimated_delivery_date->format('M d, Y') }}</td>
                    <td>{{ $shipment->actual_delivery_date->format('M d, Y') }}</td>
                    <td>{{ $daysToDeliver }}</td>
                    <td class="{{ $onTime ? 'on-time' : 'late' }}">{{ $onTimeStatus }}</td>
                    <td class="{{ $performanceScore >= 90 ? 'excellent' : ($performanceScore >= 70 ? 'good' : 'warning') }}">
                        {{ $performanceScore }}%
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        @if($shipments->count() > 20)
        <p style="text-align: center; color: #6B7280; font-style: italic;">
            Showing first 20 shipments. Total: {{ $shipments->count() }} shipments.
        </p>
        @endif
    </div>

    <div class="footer">
        <p>RT Express Performance Report | Generated on {{ $generatedAt->format('M d, Y H:i:s') }} | Confidential</p>
    </div>
</body>
</html>
