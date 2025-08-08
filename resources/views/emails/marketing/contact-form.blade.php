<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Message</title>
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
            width: 100px;
        }
        .value {
            color: #333;
        }
        .message-content {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #e9ecef;
            margin: 15px 0;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 New Contact Form Message</h1>
        <p>A new message has been submitted through the RT Express website</p>
    </div>

    <div class="content">
        <div class="info-section">
            <h3>👤 Contact Information</h3>
            <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">{{ $data['name'] }}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ $data['email'] }}</span>
            </div>
            @if(!empty($data['phone']))
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">{{ $data['phone'] }}</span>
            </div>
            @endif
            <div class="info-row">
                <span class="label">Subject:</span>
                <span class="value">{{ $data['subject'] }}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>💬 Message</h3>
            <div class="message-content">
                {{ $data['message'] }}
            </div>
        </div>

        <div class="info-section">
            <h3>⏰ Message Details</h3>
            <div class="info-row">
                <span class="label">Received:</span>
                <span class="value">{{ now()->format('F j, Y \a\t g:i A') }}</span>
            </div>
            <div class="info-row">
                <span class="label">Source:</span>
                <span class="value">RT Express Website Contact Form</span>
            </div>
        </div>

        <div style="background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">📞 Next Steps:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
                <li>Reply to the customer's email address: <strong>{{ $data['email'] }}</strong></li>
                <li>Address their inquiry about: <strong>{{ $data['subject'] }}</strong></li>
                @if(!empty($data['phone']))
                <li>Alternative contact via phone: <strong>{{ $data['phone'] }}</strong></li>
                @endif
                <li>Aim to respond within 24 hours for excellent customer service</li>
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
