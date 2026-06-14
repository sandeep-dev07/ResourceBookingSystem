-- Create Maintenance Table
-- This table stores scheduled maintenance windows for resources

CREATE TABLE IF NOT EXISTS maintenance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    maintenance_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create indexes for frequently used queries
CREATE INDEX idx_maintenance_resource_date ON maintenance(resource_id, maintenance_date);
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_maintenance_date ON maintenance(maintenance_date);

-- Sample data (optional - for testing)
-- INSERT INTO maintenance (resource_id, description, maintenance_date, start_time, end_time, type, created_by)
-- VALUES 
-- (1, 'AC filter replacement', '2024-06-20', '10:00', '11:00', 'SCHEDULED', 'manager@bookslot.com'),
-- (2, 'Projector bulb change', '2024-06-21', '14:00', '15:00', 'PREVENTIVE', 'manager@bookslot.com');
