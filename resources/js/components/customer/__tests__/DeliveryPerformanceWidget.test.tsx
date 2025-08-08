import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DeliveryPerformanceWidget from '../DeliveryPerformanceWidget';

const mockMetrics = {
    on_time_delivery_rate: 92.5,
    average_delivery_time: 48,
    total_deliveries_this_month: 125,
    total_deliveries_last_month: 110,
    early_deliveries: 15,
    on_time_deliveries: 100,
    late_deliveries: 10,
    average_delivery_time_last_month: 52,
    performance_trend: 'up' as const,
    customer_satisfaction_score: 4.3,
};

describe('DeliveryPerformanceWidget', () => {
    it('renders performance metrics correctly', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('Delivery Performance')).toBeInTheDocument();
        expect(screen.getByText('92.5%')).toBeInTheDocument();
        expect(screen.getByText('On-Time Delivery Rate')).toBeInTheDocument();
    });

    it('displays performance grade badge', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('shows trend information', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText(/deliveries.*faster/)).toBeInTheDocument();
    });

    it('displays performance breakdown', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('Early')).toBeInTheDocument();
        expect(screen.getByText('On Time')).toBeInTheDocument();
        expect(screen.getByText('Late')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('formats delivery time correctly', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('2d')).toBeInTheDocument(); // 48 hours = 2 days
    });

    it('shows monthly delivery count', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('125 deliveries')).toBeInTheDocument();
    });

    it('displays customer satisfaction score when provided', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
        expect(screen.getByText('4.3/5.0')).toBeInTheDocument();
    });

    it('handles different performance grades', () => {
        const lowPerformanceMetrics = {
            ...mockMetrics,
            on_time_delivery_rate: 75,
        };

        render(<DeliveryPerformanceWidget metrics={lowPerformanceMetrics} />);

        expect(screen.getByText('C+')).toBeInTheDocument();
    });

    it('shows downward trend correctly', () => {
        const downTrendMetrics = {
            ...mockMetrics,
            performance_trend: 'down' as const,
            total_deliveries_this_month: 95,
            average_delivery_time: 56,
        };

        render(<DeliveryPerformanceWidget metrics={downTrendMetrics} />);

        expect(screen.getByText(/deliveries.*slower/)).toBeInTheDocument();
    });

    it('handles stable trend', () => {
        const stableTrendMetrics = {
            ...mockMetrics,
            performance_trend: 'stable' as const,
        };

        render(<DeliveryPerformanceWidget metrics={stableTrendMetrics} />);

        expect(screen.getByText('Performance stable')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<DeliveryPerformanceWidget metrics={mockMetrics} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has Details button', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('calculates percentages correctly', () => {
        render(<DeliveryPerformanceWidget metrics={mockMetrics} />);

        // Early deliveries: 15/125 = 12%
        expect(screen.getByText('12.0%')).toBeInTheDocument();
        // On time deliveries: 100/125 = 80%
        expect(screen.getByText('80.0%')).toBeInTheDocument();
        // Late deliveries: 10/125 = 8%
        expect(screen.getByText('8.0%')).toBeInTheDocument();
    });
});

describe('DeliveryPerformanceWidget Edge Cases', () => {
    it('handles zero deliveries', () => {
        const zeroMetrics = {
            ...mockMetrics,
            total_deliveries_this_month: 0,
            early_deliveries: 0,
            on_time_deliveries: 0,
            late_deliveries: 0,
        };

        render(<DeliveryPerformanceWidget metrics={zeroMetrics} />);

        expect(screen.getByText('0 deliveries')).toBeInTheDocument();
    });

    it('handles very high performance rate', () => {
        const perfectMetrics = {
            ...mockMetrics,
            on_time_delivery_rate: 100,
        };

        render(<DeliveryPerformanceWidget metrics={perfectMetrics} />);

        expect(screen.getByText('100.0%')).toBeInTheDocument();
        expect(screen.getByText('A+')).toBeInTheDocument();
    });

    it('handles delivery time less than 24 hours', () => {
        const fastMetrics = {
            ...mockMetrics,
            average_delivery_time: 18,
        };

        render(<DeliveryPerformanceWidget metrics={fastMetrics} />);

        expect(screen.getByText('18h')).toBeInTheDocument();
    });

    it('handles missing customer satisfaction score', () => {
        const { customer_satisfaction_score, ...metricsWithoutSatisfaction } = mockMetrics;

        render(<DeliveryPerformanceWidget metrics={metricsWithoutSatisfaction} />);

        expect(screen.queryByText('Customer Satisfaction')).not.toBeInTheDocument();
    });
});

describe('DeliveryPerformanceWidget Performance Colors', () => {
    it('applies correct color for high performance', () => {
        const highPerformanceMetrics = {
            ...mockMetrics,
            on_time_delivery_rate: 96,
        };

        render(<DeliveryPerformanceWidget metrics={highPerformanceMetrics} />);

        const performanceRate = screen.getByText('96.0%');
        expect(performanceRate).toHaveClass('text-green-600');
    });

    it('applies correct color for medium performance', () => {
        const mediumPerformanceMetrics = {
            ...mockMetrics,
            on_time_delivery_rate: 87,
        };

        render(<DeliveryPerformanceWidget metrics={mediumPerformanceMetrics} />);

        const performanceRate = screen.getByText('87.0%');
        expect(performanceRate).toHaveClass('text-yellow-600');
    });

    it('applies correct color for low performance', () => {
        const lowPerformanceMetrics = {
            ...mockMetrics,
            on_time_delivery_rate: 75,
        };

        render(<DeliveryPerformanceWidget metrics={lowPerformanceMetrics} />);

        const performanceRate = screen.getByText('75.0%');
        expect(performanceRate).toHaveClass('text-red-600');
    });
});
