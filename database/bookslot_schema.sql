-- PostgreSQL schema for bookslot
CREATE DATABASE bookslot;

\connect bookslot

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    projector BOOLEAN NOT NULL DEFAULT FALSE,
    wifi BOOLEAN NOT NULL DEFAULT FALSE,
    ac BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_resource_date ON bookings(resource_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);

INSERT INTO resources (name, capacity, location, projector, wifi, ac, image_url)
VALUES
    ('Conference Room A', 20, 'Floor 3, East Wing', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80'),
    ('Conference Room B', 14, 'Floor 2, North Wing', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'),
    ('Training Hall', 40, 'Floor 4, Center Block', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'),
    ('AI Lab', 12, 'Floor 5, Innovation Hub', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'),
    ('Presentation Room', 16, 'Floor 1, Lobby Annex', TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80'),
    ('Discussion Cabin', 8, 'Floor 2, Quiet Corner', FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80')
ON CONFLICT DO NOTHING;
