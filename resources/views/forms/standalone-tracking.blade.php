<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RT Express - Track Shipment</title>
    
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
        
        .form-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 40px;
            padding-bottom: 40px;
        }
        
        .form-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-height: none;
        }
        
        .form-header {
            background: linear-gradient(135deg, var(--primary) 0%, #991B2E 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .form-body {
            padding: 40px 30px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, #991B2E 100%);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(196, 30, 58, 0.3);
        }
        
        .form-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f9fafb;
        }
        
        .form-input:focus {
            outline: none;
            border-color: var(--primary);
            background: white;
            box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
        }
        
        .form-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        @media (max-width: 768px) {
            .form-container {
                padding: 10px;
                padding-top: 20px;
                padding-bottom: 20px;
                min-height: auto;
            }
            
            .form-header, .form-body {
                padding: 30px 20px;
            }
            
            .form-card {
                margin: 0;
            }
        }
        
        .alert {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
        }
        
        .alert-error {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
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
        
        .form-card {
            position: relative;
            z-index: 10;
        }
        
        .tracking-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .tracking-hint {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #1e40af;
        }
    </style>
</head>
<body class="particles-bg">
    <div id="particles-js"></div>
    
    <div class="form-container">
        <div class="form-card">
            <div class="form-header">
                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Track Your Shipment</h1>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Enter your tracking number to get real-time updates</p>
            </div>
            
            <div class="form-body">
                {{-- Success Message --}}
                @if(session('success'))
                    <div class="alert alert-success">
                        <strong>✅ Success!</strong> {{ session('success') }}
                    </div>
                @endif

                {{-- Error Messages --}}
                @if($errors->any())
                    <div class="alert alert-error">
                        <strong>❌ Error:</strong>
                        <ul style="margin: 10px 0 0 20px;">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <div class="tracking-hint">
                    <strong>💡 Tip:</strong> Your tracking number was provided when you created your shipment. It usually starts with "RT" followed by numbers (e.g., RT123456789).
                </div>

                <form action="{{ route('tracking.form.submit') }}" method="POST" id="tracking-form">
                    @csrf
                    
                    <div class="form-group">
                        <label for="tracking_number" class="form-label">Tracking Number *</label>
                        <input type="text" 
                               id="tracking_number" 
                               name="tracking_number" 
                               value="{{ old('tracking_number') }}" 
                               required
                               class="form-input" 
                               placeholder="Enter your tracking number (e.g., RT123456789)"
                               style="text-transform: uppercase;">
                    </div>

                    <button type="submit" class="btn-primary">
                        🔍 Track Shipment
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Enhanced form submission with loading state
        document.getElementById('tracking-form').addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '⏳ Tracking...';
            submitBtn.disabled = true;
            
            // Re-enable button after 10 seconds as fallback
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 10000);
        });
        
        // Auto-uppercase tracking number input
        document.getElementById('tracking_number').addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Auto-focus on tracking number input
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('tracking_number').focus();
        });
    </script>
</body>
</html>
