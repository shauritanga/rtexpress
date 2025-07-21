<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>RT Express Shipments Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 15px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #10B981;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            color: #10B981;
            font-size: 20px;
            margin: 0 0 5px 0;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 12px;
        }
        
        .report-info {
            background: #F0FDF4;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 10px;
        }
        
        .report-info table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .report-info td {
            padding: 3px 8px;
            border: none;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9px;
        }
        
        .data-table th {
            background: #10B981;
            color: white;
            padding: 6px 4px;
            text-align: left;
            font-weight: bold;
            font-size: 8px;
        }
        
        .data-table td {
            padding: 4px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 8px;
        }
        
        .data-table tr:nth-child(even) {
            background: #F9FAFB;
        }
        
        .status-delivered { color: #059669; font-weight: bold; }
        .status-pending { color: #D97706; font-weight: bold; }
        .status-in-transit { color: #3B82F6; font-weight: bold; }
        .status-exception { color: #DC2626; font-weight: bold; }
        
        .summary {
            background: #F8FAFC;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .summary h3 {
            margin: 0 0 8px 0;
            color: #1F2937;
            font-size: 12px;
        }
        
        .summary-grid {
            display: table;
            width: 100%;
        }
        
        .summary-row {
            display: table-row;
        }
        
        .summary-cell {
            display: table-cell;
            width: 25%;
            padding: 5px;
            text-align: center;
        }
        
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #1F2937;
        }
        
        .summary-label {
            font-size: 9px;
            color: #6B7280;
        }
        
        .footer {
            position: fixed;
            bottom: 15px;
            left: 15px;
            right: 15px;
            text-align: center;
            font-size: 8px;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
        }
        
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RT Express Shipments Report</h1>
        <div class="subtitle">Detailed Shipment Information</div>
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
                <td><strong>Total Shipments:</strong></td>
                <td>{{ $shipments->count() }}</td>
                <td><strong>Applied Filters:</strong></td>
                <td>
                    @if(!empty($filters))
                        @foreach($filters as $key => $value)
                            @if($value)
                                {{ ucfirst(str_replace('_', ' ', $key)) }}: {{ $value }};
                            @endif
                        @endforeach
                    @else
                        None
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- Summary Section -->
    <div class="summary">
        <h3>Summary Statistics</h3>
        <div class="summary-grid">
            <div class="summary-row">
                <div class="summary-cell">
                    <div class="summary-value">{{ $shipments->count() }}</div>
                    <div class="summary-label">Total Shipments</div>
                </div>
                <div class="summary-cell">
                    <div class="summary-value">{{ $shipments->where('status', 'delivered')->count() }}</div>
                    <div class="summary-label">Delivered</div>
                </div>
                <div class="summary-cell">
                    <div class="summary-value">{{ $shipments->where('status', 'in_transit')->count() }}</div>
                    <div class="summary-label">In Transit</div>
                </div>
                <div class="summary-cell">
                    <div class="summary-value">{{ $shipments->where('status', 'pending')->count() }}</div>
                    <div class="summary-label">Pending</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Shipments Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Service</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Weight</th>
                <th>Value</th>
                <th>Created</th>
                <th>Est. Delivery</th>
            </tr>
        </thead>
        <tbody>
            @foreach($shipments as $shipment)
            <tr>
                <td>{{ $shipment->tracking_number }}</td>
                <td>{{ $shipment->customer->company_name ?? 'N/A' }}</td>
                <td class="status-{{ $shipment->status }}">
                    {{ ucfirst(str_replace('_', ' ', $shipment->status)) }}
                </td>
                <td>{{ ucfirst($shipment->service_type) }}</td>
                <td>{{ $shipment->originWarehouse->city ?? 'N/A' }}</td>
                <td>{{ $shipment->destinationWarehouse->city ?? substr($shipment->recipient_address, 0, 20) . '...' }}</td>
                <td>{{ $shipment->weight_kg }}kg</td>
                <td>${{ number_format($shipment->declared_value, 0) }}</td>
                <td>{{ $shipment->created_at->format('M d') }}</td>
                <td>{{ $shipment->estimated_delivery_date ? $shipment->estimated_delivery_date->format('M d') : 'TBD' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($shipments->count() == 0)
    <div style="text-align: center; padding: 40px; color: #6B7280;">
        <p>No shipments found matching the selected criteria.</p>
    </div>
    @endif

    <div class="footer">
        <p>RT Express Shipments Report | Generated on {{ $generatedAt->format('M d, Y H:i:s') }} | Page 1 | Confidential</p>
    </div>
</body>
</html>
