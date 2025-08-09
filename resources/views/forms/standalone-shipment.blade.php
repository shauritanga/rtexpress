<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RT Express - Request Shipment</title>
    
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
        
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        @media (max-width: 768px) {
            .grid-2 {
                grid-template-columns: 1fr;
            }

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
        

    </style>
</head>
<body class="particles-bg">
    <div id="particles-js"></div>
    
    <div class="form-container">
        <div class="form-card">
            <div class="form-header">
                <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Request a Shipment</h1>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Get a quote for your cargo delivery needs</p>
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
                        <strong>❌ Please fix the following errors:</strong>
                        <ul style="margin: 10px 0 0 20px;">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('shipment.form.submit') }}" method="POST" id="shipment-form">
                    @csrf
                    
                    <div class="grid-2">
                        <div class="form-group">
                            <label for="name" class="form-label">Full Name *</label>
                            <input type="text" id="name" name="name" value="{{ old('name') }}" required
                                class="form-input" placeholder="Enter your full name">
                        </div>
                        <div class="form-group">
                            <label for="phone" class="form-label">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" value="{{ old('phone') }}" required
                                class="form-input" placeholder="+255 XXX XXX XXX">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">Email Address *</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required
                            class="form-input" placeholder="your.email@example.com">
                    </div>

                    <div class="form-group">
                        <label for="item_description" class="form-label">Item Description *</label>
                        <textarea id="item_description" name="item_description" rows="3" required
                            class="form-input" placeholder="Describe what you're shipping (e.g., electronics, documents, furniture)">{{ old('item_description') }}</textarea>
                    </div>

                    <div class="grid-2">
                        <div class="form-group">
                            <label for="pickup_location" class="form-label">Pickup Location *</label>
                            <input type="text" id="pickup_location" name="pickup_location" value="{{ old('pickup_location') }}" required
                                class="form-input" placeholder="City, Region">
                        </div>
                        <div class="form-group">
                            <label for="delivery_location" class="form-label">Delivery Location *</label>
                            <input type="text" id="delivery_location" name="delivery_location" value="{{ old('delivery_location') }}" required
                                class="form-input" placeholder="City, Region">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="additional_notes" class="form-label">Additional Notes</label>
                        <textarea id="additional_notes" name="additional_notes" rows="3"
                            class="form-input" placeholder="Any special requirements or additional information">{{ old('additional_notes') }}</textarea>
                    </div>

                    <button type="submit" class="btn-primary">
                        📦 Request Shipment Quote
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Enhanced form submission with loading state
        document.getElementById('shipment-form').addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '⏳ Submitting...';
            submitBtn.disabled = true;
            
            // Re-enable button after 10 seconds as fallback
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 10000);
        });
        
        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });
    </script>
</body>
</html>
