import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/useToast';
import { 
    MapPin,
    Package,
    CreditCard,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    User,
    Truck
} from 'lucide-react';

// Import step components (we'll create these next)
import SenderRecipientStep from './shipment-wizard/SenderRecipientStep';
import PackageDetailsStep from './shipment-wizard/PackageDetailsStep';
import ServiceSelectionStep from './shipment-wizard/ServiceSelectionStep';
import ReviewConfirmStep from './shipment-wizard/ReviewConfirmStep';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
}

interface ServiceType {
    id: string;
    name: string;
    description: string;
    base_rate: number;
    estimated_days: string;
    features: string[];
}

interface ShipmentData {
    sender: any;
    recipient: any;
    packageDetails: any;
    serviceType: any;
    specialHandling: string[];
    totalCost: number;
}

interface Props {
    customer: Customer;
    serviceTypes: ServiceType[];
    savedAddresses: any[];
    className?: string;
}

const STEPS = [
    {
        id: 1,
        title: 'Sender & Recipient',
        description: 'Enter shipping addresses',
        icon: User,
    },
    {
        id: 2,
        title: 'Package Details',
        description: 'Weight, dimensions & contents',
        icon: Package,
    },
    {
        id: 3,
        title: 'Service Selection',
        description: 'Choose shipping service',
        icon: Truck,
    },
    {
        id: 4,
        title: 'Review & Confirm',
        description: 'Confirm and create shipment',
        icon: CheckCircle,
    },
];

export default function ShipmentCreationWizard({ 
    customer, 
    serviceTypes, 
    savedAddresses, 
    className = '' 
}: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [shipmentData, setShipmentData] = useState<ShipmentData>({
        sender: {
            company_name: customer.company_name,
            contact_person: customer.contact_person,
            email: customer.email,
            phone: customer.phone,
            address_line_1: customer.address_line_1,
            address_line_2: customer.address_line_2,
            city: customer.city,
            state_province: customer.state_province,
            postal_code: customer.postal_code,
            country: customer.country,
        },
        recipient: {
            contact_person: '',
            email: '',
            phone: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state_province: '',
            postal_code: '',
            country: 'US',
        },
        packageDetails: {
            weight: 0,
            weight_unit: 'lbs',
            length: 0,
            width: 0,
            height: 0,
            dimension_unit: 'in',
            declared_value: 0,
            currency: 'USD',
            contents_description: '',
            package_type: 'box',
            special_handling: [],
            insurance_required: false,
            signature_required: false,
        },
        serviceType: null,
        specialHandling: [],
        totalCost: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateShipmentData = (stepData: any) => {
        setShipmentData(prev => ({ ...prev, ...stepData }));
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/customer/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(shipmentData),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Shipment Created Successfully!",
                    description: "Your shipment has been created and is being processed. You will receive updates via email and SMS.",
                    variant: "success",
                });

                // Redirect to shipment details page after showing toast
                setTimeout(() => {
                    window.location.href = result.redirect || '/customer/dashboard';
                }, 2000);
            } else {
                throw new Error(result.message || 'Failed to create shipment');
            }
        } catch (error) {
            console.error('Error creating shipment:', error);
            toast({
                title: "Failed to Create Shipment",
                description: "Please check the form for errors and try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepComponent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <SenderRecipientStep
                        data={shipmentData}
                        savedAddresses={savedAddresses}
                        onUpdate={updateShipmentData}
                        onNext={nextStep}
                    />
                );
            case 2:
                return (
                    <PackageDetailsStep
                        data={shipmentData}
                        onUpdate={updateShipmentData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 3:
                return (
                    <ServiceSelectionStep
                        data={shipmentData}
                        serviceTypes={serviceTypes}
                        onUpdate={updateShipmentData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 4:
                return (
                    <ReviewConfirmStep
                        data={shipmentData}
                        onSubmit={handleSubmit}
                        onPrev={prevStep}
                        isSubmitting={isSubmitting}
                    />
                );
            default:
                return null;
        }
    };

    const progressPercentage = (currentStep / STEPS.length) * 100;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Progress Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <CardTitle>Shipment Creation Progress</CardTitle>
                        <Badge variant="outline">
                            Step {currentStep} of {STEPS.length}
                        </Badge>
                    </div>
                    <Progress value={progressPercentage} className="h-2 mb-4" />
                    
                    {/* Step Indicators */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            
                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-blue-50 border-2 border-blue-200' 
                                            : isCompleted 
                                                ? 'bg-green-50 border-2 border-green-200' 
                                                : 'bg-gray-50 border-2 border-gray-200'
                                    }`}
                                >
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                        isActive 
                                            ? 'bg-blue-600 text-white' 
                                            : isCompleted 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-400 text-white'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <Icon className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${
                                            isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className={`text-xs ${
                                            isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardHeader>
            </Card>

            {/* Current Step Content */}
            <div className="min-h-[600px]">
                {getStepComponent()}
            </div>
        </div>
    );
}
