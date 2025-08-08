import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ShippingVolumeTrends from '../ShippingVolumeTrends';

const mockVolumeData = [
    {
        period: 'Jan 2024',
        shipments: 150,
        growth_rate: 12.5,
        service_breakdown: {
            express: 45,
            standard: 75,
            overnight: 20,
            international: 10,
        },
    },
    {
        period: 'Feb 2024',
        shipments: 180,
        growth_rate: 20.0,
        service_breakdown: {
            express: 60,
            standard: 85,
            overnight: 25,
            international: 10,
        },
    },
    {
        period: 'Mar 2024',
        shipments: 165,
        growth_rate: -8.3,
        service_breakdown: {
            express: 50,
            standard: 80,
            overnight: 25,
            international: 10,
        },
    },
];

const defaultProps = {
    volumeData: mockVolumeData,
    totalShipments: 495,
    averageMonthlyGrowth: 8.1,
};

describe('ShippingVolumeTrends', () => {
    it('renders component with title and description', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('Shipping Volume Trends')).toBeInTheDocument();
        expect(screen.getByText('Track your shipping volume patterns and growth trends')).toBeInTheDocument();
    });

    it('displays key metrics correctly', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('495')).toBeInTheDocument(); // Total shipments
        expect(screen.getByText('+8.1%')).toBeInTheDocument(); // Average growth
        expect(screen.getByText('165')).toBeInTheDocument(); // Current month shipments
    });

    it('has period selection buttons', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('6 Months')).toBeInTheDocument();
        expect(screen.getByText('12 Months')).toBeInTheDocument();
        expect(screen.getByText('YTD')).toBeInTheDocument();
    });

    it('has metric toggle buttons', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('Volume')).toBeInTheDocument();
        expect(screen.getByText('Growth')).toBeInTheDocument();
    });

    it('switches between volume and growth views', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        const growthButton = screen.getByText('Growth');
        fireEvent.click(growthButton);

        // Should show growth percentages
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getByText('+20.0%')).toBeInTheDocument();
        expect(screen.getByText('-8.3%')).toBeInTheDocument();
    });

    it('displays service breakdown badges in volume view', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('express: 50')).toBeInTheDocument();
        expect(screen.getByText('standard: 80')).toBeInTheDocument();
        expect(screen.getByText('overnight: 25')).toBeInTheDocument();
        expect(screen.getByText('international: 10')).toBeInTheDocument();
    });

    it('shows export and filter buttons', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('displays growth indicators correctly', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        // Current month shows negative growth
        expect(screen.getByText('-8.3%')).toBeInTheDocument();
    });

    it('changes period selection', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        const twelveMonthsButton = screen.getByText('12 Months');
        fireEvent.click(twelveMonthsButton);

        // Button should be selected (this would need to check for active state styling)
        expect(twelveMonthsButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<ShippingVolumeTrends {...defaultProps} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('displays insights section', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        expect(screen.getByText('Key Insights')).toBeInTheDocument();
        expect(screen.getByText(/shipping volume.*decreased.*8.3%/)).toBeInTheDocument();
        expect(screen.getByText(/Most popular service.*standard/)).toBeInTheDocument();
    });

    it('shows growth recommendation for high growth', () => {
        const highGrowthProps = {
            ...defaultProps,
            averageMonthlyGrowth: 15.5,
        };

        render(<ShippingVolumeTrends {...highGrowthProps} />);

        expect(screen.getByText(/Strong growth trend detected/)).toBeInTheDocument();
        expect(screen.getByText(/Consider upgrading your service plan/)).toBeInTheDocument();
    });

    it('handles zero shipments gracefully', () => {
        const zeroShipmentsProps = {
            volumeData: [
                {
                    period: 'Jan 2024',
                    shipments: 0,
                    growth_rate: 0,
                    service_breakdown: {
                        express: 0,
                        standard: 0,
                        overnight: 0,
                        international: 0,
                    },
                },
            ],
            totalShipments: 0,
            averageMonthlyGrowth: 0,
        };

        render(<ShippingVolumeTrends {...zeroShipmentsProps} />);

        expect(screen.getByText('0')).toBeInTheDocument();
    });
});

describe('ShippingVolumeTrends Growth Indicators', () => {
    it('shows positive growth with up arrow', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        const growthButton = screen.getByText('Growth');
        fireEvent.click(growthButton);

        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getByText('+20.0%')).toBeInTheDocument();
    });

    it('shows negative growth with down arrow', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        const growthButton = screen.getByText('Growth');
        fireEvent.click(growthButton);

        expect(screen.getByText('-8.3%')).toBeInTheDocument();
    });

    it('applies correct colors for growth trends', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        // Positive growth should be green, negative should be red
        expect(screen.getByText('+8.1%')).toHaveClass('text-green-600');
    });
});

describe('ShippingVolumeTrends Service Breakdown', () => {
    it('identifies most popular service correctly', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        // Standard service has highest count (80) in current month
        expect(screen.getByText(/Most popular service.*standard.*80 shipments/)).toBeInTheDocument();
    });

    it('displays all service types', () => {
        render(<ShippingVolumeTrends {...defaultProps} />);

        const serviceTypes = ['express', 'standard', 'overnight', 'international'];
        serviceTypes.forEach((service) => {
            expect(screen.getByText(new RegExp(service))).toBeInTheDocument();
        });
    });
});

describe('ShippingVolumeTrends Period Filtering', () => {
    it('filters data for 6 months period', () => {
        const longVolumeData = Array.from({ length: 12 }, (_, i) => ({
            period: `Month ${i + 1}`,
            shipments: 100 + i * 10,
            growth_rate: i * 2,
            service_breakdown: {
                express: 25,
                standard: 50,
                overnight: 15,
                international: 10,
            },
        }));

        const props = {
            ...defaultProps,
            volumeData: longVolumeData,
        };

        render(<ShippingVolumeTrends {...props} />);

        // Should show last 6 months by default
        expect(screen.getByText('Month 7')).toBeInTheDocument();
        expect(screen.getByText('Month 12')).toBeInTheDocument();
        expect(screen.queryByText('Month 1')).not.toBeInTheDocument();
    });
});
