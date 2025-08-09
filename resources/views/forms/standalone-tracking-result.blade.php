<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RT Express - Tracking Results</title>
    
    {{-- Use Vite for CSS and JS assets --}}
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    
    <style>
        :root {
            --primary: #C41E3A;
            --secondary: #1F2937;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            overflow-x: hidden;
            overflow-y: auto;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 40px;
            padding-bottom: 40px;
        }
        
        .result-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
        }
        
        .result-header {
            background: linear-gradient(135deg, var(--primary) 0%, #991B2E 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .result-body {
            padding: 40px 30px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-in_transit { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .status-processing { background: #e0e7ff; color: #3730a3; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .info-value {
            color: #1f2937;
            font-size: 16px;
        }
        
        .btn-secondary {
            background: #6b7280;
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
            transform: translateY(-1px);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, #991B2E 100%);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin-left: 10px;
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(196, 30, 58, 0.3);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
                padding-top: 20px;
                padding-bottom: 20px;
            }
            
            .result-header, .result-body {
                padding: 30px 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .btn-primary {
                margin-left: 0;
                margin-top: 10px;
            }
        }
        
        .particles-bg {
            position: relative;
            overflow: hidden;
        }
        
        #particles-js {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        .result-card {
            position: relative;
            z-index: 10;
        }
        
        .tracking-number {
            font-family: 'Courier New', monospace;
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body class="particles-bg">
    <div id="particles-js"></div>
    
    <div class="container">
        <div class="result-card">
            <div class="result-header">
                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Shipment Found!</h1>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">
                    Tracking Number: <span class="tracking-number">{{ $shipment->tracking_number }}</span>
                </p>
            </div>
            
            <div class="result-body">
                <div style="text-align: center; margin-bottom: 30px;">
                    <span class="status-badge status-{{ strtolower(str_replace(' ', '_', $shipment->status)) }}">
                        {{ ucfirst($shipment->status) }}
                    </span>
                </div>

                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">📦 Service Type</div>
                        <div class="info-value">{{ ucfirst($shipment->service_type) }}</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">📅 Created Date</div>
                        <div class="info-value">{{ $shipment->created_at->format('F j, Y') }}</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">🔄 Last Updated</div>
                        <div class="info-value">{{ $shipment->updated_at->format('F j, Y g:i A') }}</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">💰 Total Amount</div>
                        <div class="info-value">
                            @if($shipment->total_amount)
                                TZS {{ number_format($shipment->total_amount, 0) }}
                            @else
                                Pending Quote
                            @endif
                        </div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">📍 From</div>
                        <div class="info-value">{{ $shipment->origin_address }}</div>
                        <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                            <strong>Sender:</strong> {{ $shipment->sender_name }}
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">🎯 To</div>
                        <div class="info-value">{{ $shipment->destination_address }}</div>
                        <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                            <strong>Recipient:</strong> {{ $shipment->recipient_name }}
                        </div>
                    </div>
                </div>

                @if($shipment->notes)
                <div class="info-card" style="margin-top: 20px;">
                    <div class="info-label">📝 Notes</div>
                    <div class="info-value">{{ $shipment->notes }}</div>
                </div>
                @endif

                <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                    <a href="{{ route('tracking.form.standalone') }}" class="btn-secondary">
                        ← Track Another Shipment
                    </a>
                    <a href="javascript:window.print()" class="btn-primary">
                        🖨️ Print Details
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds for live updates
        setTimeout(() => {
            window.location.reload();
        }, 30000);
        
        // Print functionality
        window.addEventListener('beforeprint', function() {
            document.body.style.background = 'white';
        });
        
        window.addEventListener('afterprint', function() {
            document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        });
    </script>
</body>
</html>
