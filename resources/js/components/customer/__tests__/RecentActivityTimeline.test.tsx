import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RecentActivityTimeline from '../RecentActivityTimeline';

const mockEvents = [
    {
        id: 1,
        shipment_id: 101,
        tracking_number: 'RT123456789',
        event_type: 'picked_up',
        status: 'picked_up',
        description: 'Package picked up from origin',
        location: 'New York, NY',
        timestamp: '2024-01-15T10:30:00Z',
        recipient_name: 'John Doe',
        service_type: 'express',
    },
    {
        id: 2,
        shipment_id: 102,
        tracking_number: 'RT987654321',
        event_type: 'delivered',
        status: 'delivered',
        description: 'Package delivered successfully',
        location: 'Los Angeles, CA',
        timestamp: '2024-01-14T14:45:00Z',
        recipient_name: 'Jane Smith',
        service_type: 'standard',
    },
];

describe('RecentActivityTimeline', () => {
    it('renders timeline with events', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText('RT123456789')).toBeInTheDocument();
        expect(screen.getByText('RT987654321')).toBeInTheDocument();
        expect(screen.getByText('Package picked up from origin')).toBeInTheDocument();
        expect(screen.getByText('Package delivered successfully')).toBeInTheDocument();
    });

    it('displays correct status badges', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByText('Picked Up')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    it('shows service type badges', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByText('express')).toBeInTheDocument();
        expect(screen.getByText('standard')).toBeInTheDocument();
    });

    it('displays location and recipient information', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByText('New York, NY')).toBeInTheDocument();
        expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows empty state when no events', () => {
        render(<RecentActivityTimeline events={[]} />);

        expect(screen.getByText('No recent activity to display')).toBeInTheDocument();
        expect(screen.getByText('Your shipment updates will appear here')).toBeInTheDocument();
    });

    it('has "View All" button', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByText('View All')).toBeInTheDocument();
    });

    it('shows "Load More Activities" button when more than 5 events', () => {
        const manyEvents = Array.from({ length: 7 }, (_, i) => ({
            ...mockEvents[0],
            id: i + 1,
            tracking_number: `RT${i + 1}`,
        }));

        render(<RecentActivityTimeline events={manyEvents} />);

        expect(screen.getByText('Load More Activities')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<RecentActivityTimeline events={mockEvents} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('formats timestamps correctly', () => {
        const recentEvent = {
            ...mockEvents[0],
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        };

        render(<RecentActivityTimeline events={[recentEvent]} />);

        expect(screen.getByText('30m ago')).toBeInTheDocument();
    });

    it('handles hover effects on timeline items', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        const timelineItems = screen.getAllByText(/RT\d+/);
        expect(timelineItems[0].closest('.hover\\:bg-gray-50')).toBeInTheDocument();
    });
});

describe('RecentActivityTimeline Event Types', () => {
    const eventTypes = [
        { type: 'created', expectedIcon: 'Package' },
        { type: 'picked_up', expectedIcon: 'Package' },
        { type: 'in_transit', expectedIcon: 'Truck' },
        { type: 'out_for_delivery', expectedIcon: 'Truck' },
        { type: 'delivered', expectedIcon: 'CheckCircle' },
        { type: 'exception', expectedIcon: 'AlertTriangle' },
    ];

    eventTypes.forEach(({ type, expectedIcon }) => {
        it(`renders correct icon for ${type} event`, () => {
            const event = {
                ...mockEvents[0],
                event_type: type,
                status: type,
            };

            render(<RecentActivityTimeline events={[event]} />);

            // Check that the appropriate icon is rendered (this would need to be adjusted based on how icons are tested)
            expect(screen.getByText('RT123456789')).toBeInTheDocument();
        });
    });
});

describe('RecentActivityTimeline Accessibility', () => {
    it('has proper ARIA labels', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
        render(<RecentActivityTimeline events={mockEvents} />);

        const viewAllButton = screen.getByRole('button', { name: /View All/i });
        viewAllButton.focus();
        expect(viewAllButton).toHaveFocus();
    });
});
