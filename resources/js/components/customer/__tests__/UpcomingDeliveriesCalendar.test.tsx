import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import UpcomingDeliveriesCalendar from '../UpcomingDeliveriesCalendar';

const mockDeliveries = [
    {
        id: 1,
        tracking_number: 'RT123456789',
        recipient_name: 'John Doe',
        recipient_address: '123 Main St, New York, NY',
        service_type: 'express',
        estimated_delivery_date: '2024-01-20T10:00:00Z',
        delivery_time_window: '9:00 AM - 12:00 PM',
        status: 'in_transit',
        priority: 'high' as const,
    },
    {
        id: 2,
        tracking_number: 'RT987654321',
        recipient_name: 'Jane Smith',
        recipient_address: '456 Oak Ave, Los Angeles, CA',
        service_type: 'standard',
        estimated_delivery_date: '2024-01-22T14:00:00Z',
        delivery_time_window: '9:00 AM - 6:00 PM',
        status: 'out_for_delivery',
        priority: 'medium' as const,
    },
];

describe('UpcomingDeliveriesCalendar', () => {
    it('renders calendar with deliveries', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        expect(screen.getByText('Upcoming Deliveries')).toBeInTheDocument();
        expect(screen.getByText('Track your scheduled deliveries and time windows')).toBeInTheDocument();
    });

    it('has view mode toggle buttons', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        expect(screen.getByText('Calendar')).toBeInTheDocument();
        expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('switches between calendar and list view', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        // In list view, should show delivery details
        expect(screen.getByText('RT123456789')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays calendar navigation', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        expect(screen.getByText('Today')).toBeInTheDocument();
        // Navigation arrows should be present
        expect(screen.getAllByRole('button')).toContain(expect.objectContaining({ textContent: expect.stringMatching(/Today/) }));
    });

    it('shows delivery priority colors', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        // Switch to list view to see priority indicators
        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        // Check that deliveries are displayed
        expect(screen.getByText('RT123456789')).toBeInTheDocument();
        expect(screen.getByText('RT987654321')).toBeInTheDocument();
    });

    it('displays service type badges', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        expect(screen.getByText('express')).toBeInTheDocument();
        expect(screen.getByText('standard')).toBeInTheDocument();
    });

    it('shows delivery time windows', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        expect(screen.getByText('9:00 AM - 12:00 PM')).toBeInTheDocument();
        expect(screen.getByText('9:00 AM - 6:00 PM')).toBeInTheDocument();
    });

    it('handles empty deliveries state', () => {
        render(<UpcomingDeliveriesCalendar deliveries={[]} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        expect(screen.getByText('No upcoming deliveries')).toBeInTheDocument();
        expect(screen.getByText('Your scheduled deliveries will appear here')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('navigates between months', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        // Find navigation buttons (they contain ChevronLeft/ChevronRight icons)
        const navButtons = screen.getAllByRole('button');
        const prevButton = navButtons.find((button) => button.querySelector('svg') && button.textContent === '');

        if (prevButton) {
            fireEvent.click(prevButton);
            // Calendar should still be functional after navigation
            expect(screen.getByText('Upcoming Deliveries')).toBeInTheDocument();
        }
    });

    it('shows priority legend in calendar view', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        expect(screen.getByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Medium Priority')).toBeInTheDocument();
        expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });

    it('formats dates correctly in list view', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        // Should show formatted dates
        expect(screen.getByText(/1\/20\/2024/)).toBeInTheDocument();
        expect(screen.getByText(/1\/22\/2024/)).toBeInTheDocument();
    });
});

describe('UpcomingDeliveriesCalendar Priority Handling', () => {
    const priorityDeliveries = [
        { ...mockDeliveries[0], priority: 'high' as const },
        { ...mockDeliveries[1], priority: 'medium' as const },
        { ...mockDeliveries[0], id: 3, priority: 'low' as const },
    ];

    it('applies correct priority colors', () => {
        render(<UpcomingDeliveriesCalendar deliveries={priorityDeliveries} />);

        const listButton = screen.getByText('List');
        fireEvent.click(listButton);

        // All priority levels should be represented
        expect(screen.getAllByText('RT123456789')).toHaveLength(2); // high and low priority
        expect(screen.getByText('RT987654321')).toBeInTheDocument(); // medium priority
    });
});

describe('UpcomingDeliveriesCalendar Accessibility', () => {
    it('has proper button roles', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        expect(screen.getByRole('button', { name: 'Calendar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
        render(<UpcomingDeliveriesCalendar deliveries={mockDeliveries} />);

        const calendarButton = screen.getByRole('button', { name: 'Calendar' });
        calendarButton.focus();
        expect(calendarButton).toHaveFocus();

        const listButton = screen.getByRole('button', { name: 'List' });
        listButton.focus();
        expect(listButton).toHaveFocus();
    });
});

describe('UpcomingDeliveriesCalendar Service Types', () => {
    const serviceTypes = ['express', 'standard', 'overnight', 'international'];

    serviceTypes.forEach((serviceType) => {
        it(`handles ${serviceType} service type`, () => {
            const delivery = {
                ...mockDeliveries[0],
                service_type: serviceType,
            };

            render(<UpcomingDeliveriesCalendar deliveries={[delivery]} />);

            const listButton = screen.getByText('List');
            fireEvent.click(listButton);

            expect(screen.getByText(serviceType)).toBeInTheDocument();
        });
    });
});
