<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Shipment Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #C41E3A 0%, #991B2E 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .info-section {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 6px;
            border-left: 4px solid #C41E3A;
        }
        .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #C41E3A;
            display: inline-block;
            width: 150px;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 6px;
            font-size: 14px;
            color: #666;
        }
        .logo {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            vertical-align: middle;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚛 New Shipment Request</h1>
        <p>A new shipment request has been submitted through the RT Express website</p>
    </div>

    <div class="content">
        <div class="info-section">
            <h3>📋 Customer Information</h3>
            <div class="info-row">
                <span class="label">Full Name:</span>
                <span class="value">{{ $data['name'] }}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ $data['email'] }}</span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">{{ $data['phone'] }}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>📦 Shipment Details</h3>
            <div class="info-row">
                <span class="label">Item Description:</span>
                <span class="value">{{ $data['item_description'] }}</span>
            </div>
            <div class="info-row">
                <span class="label">Pickup Location:</span>
                <span class="value">{{ $data['pickup_location'] }}</span>
            </div>
            <div class="info-row">
                <span class="label">Delivery Location:</span>
                <span class="value">{{ $data['delivery_location'] }}</span>
            </div>
            @if(!empty($data['additional_notes']))
            <div class="info-row">
                <span class="label">Additional Notes:</span>
                <span class="value">{{ $data['additional_notes'] }}</span>
            </div>
            @endif
        </div>

        <div class="info-section">
            <h3>⏰ Request Details</h3>
            <div class="info-row">
                <span class="label">Submitted:</span>
                <span class="value">{{ now()->format('F j, Y \a\t g:i A') }}</span>
            </div>
            <div class="info-row">
                <span class="label">Source:</span>
                <span class="value">RT Express Website</span>
            </div>
        </div>

        <div style="background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">📞 Next Steps:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>Contact the customer within 24 hours</li>
                <li>Provide a detailed quote based on the shipment requirements</li>
                <li>Schedule pickup if the customer accepts the quote</li>
                <li>Create the shipment in the RT Express system</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>RT Express</strong> - Professional Cargo Management</p>
        <p>This email was automatically generated from the RT Express website contact form.</p>
        <p style="font-size: 12px; color: #999;">
            Received: {{ now()->format('Y-m-d H:i:s') }} | 
            IP: {{ request()->ip() }}
        </p>
    </div>
</body>
</html>
