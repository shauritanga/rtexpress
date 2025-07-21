# RT Express Database Schema Design

## Overview

Comprehensive database schema for RT Express Cargo Management System supporting shipment tracking, customer management, warehouse operations, billing, and compliance.

## Core Entities & Relationships

### 1. Users & Authentication

```sql
users (existing - extend)
├── id (primary key)
├── name
├── email (unique)
├── email_verified_at
├── password
├── phone
├── avatar
├── status (active, inactive, suspended)
├── last_login_at
├── created_at
├── updated_at

roles
├── id (primary key)
├── name (admin, warehouse_staff, billing_admin, customer_support)
├── display_name
├── description
├── created_at
├── updated_at

permissions
├── id (primary key)
├── name (shipments.create, shipments.view, etc.)
├── display_name
├── description
├── module (shipments, billing, warehouse, etc.)
├── created_at
├── updated_at

role_user (pivot)
├── user_id (foreign key)
├── role_id (foreign key)
├── assigned_at
├── assigned_by

permission_role (pivot)
├── permission_id (foreign key)
├── role_id (foreign key)
```

### 2. Customer Management

```sql
customers
├── id (primary key)
├── customer_code (unique, auto-generated)
├── company_name
├── contact_person
├── email
├── phone
├── address_line_1
├── address_line_2
├── city
├── state_province
├── postal_code
├── country
├── tax_number
├── credit_limit
├── payment_terms (net_30, net_60, etc.)
├── status (active, inactive, suspended)
├── notes
├── created_by (foreign key to users)
├── created_at
├── updated_at
```

### 3. Warehouse Management

```sql
warehouses
├── id (primary key)
├── code (unique)
├── name
├── address_line_1
├── address_line_2
├── city
├── state_province
├── postal_code
├── country
├── latitude
├── longitude
├── capacity_cubic_meters
├── operating_hours
├── contact_person
├── phone
├── email
├── status (active, inactive, maintenance)
├── created_at
├── updated_at

warehouse_zones
├── id (primary key)
├── warehouse_id (foreign key)
├── zone_code
├── zone_name
├── zone_type (receiving, storage, shipping, cold_storage)
├── capacity
├── status (active, inactive, full)
├── created_at
├── updated_at
```

### 4. Inventory Management

```sql
products
├── id (primary key)
├── sku (unique)
├── name
├── description
├── category
├── weight_kg
├── dimensions_length_cm
├── dimensions_width_cm
├── dimensions_height_cm
├── hazardous_material (boolean)
├── temperature_controlled (boolean)
├── fragile (boolean)
├── status (active, discontinued)
├── created_at
├── updated_at

inventory
├── id (primary key)
├── warehouse_id (foreign key)
├── warehouse_zone_id (foreign key)
├── product_id (foreign key)
├── quantity_available
├── quantity_reserved
├── quantity_damaged
├── reorder_point
├── max_stock_level
├── last_counted_at
├── created_at
├── updated_at

inventory_movements
├── id (primary key)
├── inventory_id (foreign key)
├── movement_type (in, out, transfer, adjustment, damage)
├── quantity
├── reference_type (shipment, adjustment, transfer)
├── reference_id
├── notes
├── performed_by (foreign key to users)
├── performed_at
├── created_at
```

### 5. Shipment Management

```sql
shipments
├── id (primary key)
├── tracking_number (unique, auto-generated)
├── customer_id (foreign key)
├── origin_warehouse_id (foreign key)
├── destination_warehouse_id (foreign key, nullable)
├── sender_name
├── sender_phone
├── sender_address
├── recipient_name
├── recipient_phone
├── recipient_address
├── service_type (standard, express, overnight, international)
├── package_type (document, package, pallet, container)
├── weight_kg
├── dimensions_length_cm
├── dimensions_width_cm
├── dimensions_height_cm
├── declared_value
├── insurance_value
├── special_instructions
├── status (pending, picked_up, in_transit, out_for_delivery, delivered, exception, cancelled)
├── estimated_delivery_date
├── actual_delivery_date
├── delivery_signature
├── delivery_notes
├── created_by (foreign key to users)
├── assigned_to (foreign key to users)
├── created_at
├── updated_at

shipment_items
├── id (primary key)
├── shipment_id (foreign key)
├── product_id (foreign key, nullable)
├── description
├── quantity
├── weight_kg
├── value
├── created_at
├── updated_at

shipment_tracking
├── id (primary key)
├── shipment_id (foreign key)
├── status
├── location
├── notes
├── occurred_at
├── recorded_by (foreign key to users)
├── created_at
```

### 6. Route & Carrier Management

```sql
carriers
├── id (primary key)
├── name
├── code (unique)
├── contact_person
├── phone
├── email
├── address
├── service_types (json)
├── coverage_areas (json)
├── pricing_model
├── status (active, inactive)
├── created_at
├── updated_at

routes
├── id (primary key)
├── route_code (unique)
├── origin_warehouse_id (foreign key)
├── destination_warehouse_id (foreign key)
├── carrier_id (foreign key)
├── distance_km
├── estimated_duration_hours
├── cost_per_kg
├── status (active, inactive, suspended)
├── created_at
├── updated_at

route_stops
├── id (primary key)
├── route_id (foreign key)
├── stop_order
├── location_name
├── address
├── latitude
├── longitude
├── estimated_arrival
├── estimated_departure
├── created_at
├── updated_at
```

### 7. Billing & Financial Management

```sql
invoices
├── id (primary key)
├── invoice_number (unique, auto-generated)
├── customer_id (foreign key)
├── invoice_date
├── due_date
├── subtotal
├── tax_amount
├── discount_amount
├── total_amount
├── currency (USD, TZS, EUR, etc.)
├── exchange_rate
├── status (draft, sent, paid, overdue, cancelled)
├── payment_terms
├── notes
├── created_by (foreign key to users)
├── created_at
├── updated_at

invoice_items
├── id (primary key)
├── invoice_id (foreign key)
├── shipment_id (foreign key, nullable)
├── description
├── quantity
├── unit_price
├── total_price
├── created_at
├── updated_at

payments
├── id (primary key)
├── invoice_id (foreign key)
├── payment_method (stripe, paypal, clickpesa, bank_transfer, cash)
├── payment_reference
├── amount
├── currency
├── exchange_rate
├── payment_date
├── status (pending, completed, failed, refunded)
├── gateway_response (json)
├── processed_by (foreign key to users)
├── created_at
├── updated_at
```

## Indexes & Performance Optimization

### Primary Indexes

- All foreign keys will have indexes
- Unique constraints on business identifiers (tracking_number, customer_code, etc.)
- Composite indexes on frequently queried combinations

### Search Optimization

```sql
-- Shipment search optimization
INDEX idx_shipments_search ON shipments (tracking_number, status, created_at);
INDEX idx_shipments_customer ON shipments (customer_id, status, created_at);

-- Customer search
INDEX idx_customers_search ON customers (customer_code, company_name, email);

-- Inventory optimization
INDEX idx_inventory_warehouse ON inventory (warehouse_id, product_id);
INDEX idx_inventory_levels ON inventory (quantity_available, reorder_point);

-- Financial reporting
INDEX idx_invoices_reporting ON invoices (customer_id, invoice_date, status);
INDEX idx_payments_reporting ON payments (payment_date, status, payment_method);
```

## Data Integrity & Constraints

### Business Rules

1. **Shipment tracking numbers** must be unique and auto-generated
2. **Customer codes** must be unique and follow format: CUS-YYYY-NNNN
3. **Invoice numbers** must be unique and follow format: INV-YYYY-NNNN
4. **Inventory quantities** cannot be negative
5. **Payment amounts** must match invoice totals
6. **Shipment status** transitions must follow business logic

### Audit Trail

All critical tables will include:

- `created_at` and `updated_at` timestamps
- `created_by` and `updated_by` user references where applicable
- Soft deletes for data retention compliance

## Security Considerations

### Data Protection

- Sensitive customer data will be encrypted at rest
- PII fields will have appropriate access controls
- Payment information will follow PCI compliance standards

### Access Control

- Role-based permissions for all operations
- Row-level security for multi-tenant scenarios
- Audit logging for all data modifications

## Additional Tables

### 8. Customer Support Management

```sql
support_tickets
├── id (primary key)
├── ticket_number (unique, auto-generated)
├── customer_id (foreign key)
├── shipment_id (foreign key, nullable)
├── subject
├── description
├── priority (low, medium, high, urgent)
├── status (open, in_progress, resolved, closed)
├── category (general, billing, shipment, complaint)
├── assigned_to (foreign key to users)
├── resolution_notes
├── resolved_at
├── created_by (foreign key to users)
├── created_at
├── updated_at

ticket_messages
├── id (primary key)
├── ticket_id (foreign key)
├── sender_type (customer, staff)
├── sender_id (foreign key to users or customers)
├── message
├── attachments (json)
├── is_internal (boolean)
├── created_at
├── updated_at

ticket_attachments
├── id (primary key)
├── ticket_id (foreign key)
├── message_id (foreign key, nullable)
├── filename
├── file_path
├── file_size
├── mime_type
├── uploaded_by (foreign key to users)
├── created_at
```

### 9. Customs & Compliance

```sql
customs_documents
├── id (primary key)
├── shipment_id (foreign key)
├── document_type (commercial_invoice, packing_list, certificate_origin, etc.)
├── document_number
├── filename
├── file_path
├── file_size
├── mime_type
├── status (pending, approved, rejected)
├── reviewed_by (foreign key to users)
├── reviewed_at
├── notes
├── uploaded_by (foreign key to users)
├── created_at
├── updated_at

compliance_checks
├── id (primary key)
├── shipment_id (foreign key)
├── check_type (customs, security, hazmat, etc.)
├── status (pending, passed, failed, waived)
├── checked_by (foreign key to users)
├── checked_at
├── notes
├── created_at
├── updated_at

audit_logs
├── id (primary key)
├── user_id (foreign key)
├── action (create, update, delete, view)
├── model_type (shipment, customer, invoice, etc.)
├── model_id
├── old_values (json)
├── new_values (json)
├── ip_address
├── user_agent
├── created_at
```

### 10. System Configuration

```sql
settings
├── id (primary key)
├── key (unique)
├── value (json)
├── description
├── is_public (boolean)
├── updated_by (foreign key to users)
├── created_at
├── updated_at

notifications
├── id (primary key)
├── user_id (foreign key)
├── type (shipment_update, payment_received, etc.)
├── title
├── message
├── data (json)
├── read_at
├── created_at
├── updated_at

notification_preferences
├── id (primary key)
├── user_id (foreign key)
├── notification_type
├── email_enabled (boolean)
├── sms_enabled (boolean)
├── push_enabled (boolean)
├── created_at
├── updated_at
```

## Migration Order

The migrations should be created in this order to respect foreign key dependencies:

1. **Core System Tables**
   - roles
   - permissions
   - role_user (pivot)
   - permission_role (pivot)
   - settings

2. **Master Data Tables**
   - customers
   - warehouses
   - warehouse_zones
   - products
   - carriers

3. **Operational Tables**
   - inventory
   - inventory_movements
   - routes
   - route_stops

4. **Transaction Tables**
   - shipments
   - shipment_items
   - shipment_tracking
   - invoices
   - invoice_items
   - payments

5. **Support & Compliance Tables**
   - support_tickets
   - ticket_messages
   - ticket_attachments
   - customs_documents
   - compliance_checks

6. **System Tables**
   - audit_logs
   - notifications
   - notification_preferences

## Sample Data Requirements

For development and testing, we'll need:

- Default roles and permissions
- Sample warehouses and zones
- Test customers and products
- Sample shipments with various statuses
- Test invoices and payments
- Support tickets for different scenarios
