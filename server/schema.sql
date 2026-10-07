-- EventHub PostgreSQL schema + development seed
-- Safe to re-run on a fresh or existing `eventhub` database.
--
-- Development logins (NOT for production):
--   admin@example.com / Admin123!
--   staff@example.com / Staff123!
-- Passwords are stored as bcrypt hashes only.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff'))
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_max_participants_check CHECK (max_participants > 0),
  CONSTRAINT events_status_check CHECK (status IN ('draft', 'published', 'cancelled')),
  CONSTRAINT events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT participants_email_key UNIQUE (email)
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT registrations_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CONSTRAINT registrations_event_participant_key UNIQUE (event_id, participant_id),
  CONSTRAINT registrations_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT registrations_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES participants (id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

-- UNIQUE(email) already indexes users.email and participants.email.
-- UNIQUE(event_id, participant_id) already supports lookups by event_id (leftmost column).
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_event_date ON events (event_date);
CREATE INDEX idx_events_created_by ON events (created_by);
CREATE INDEX idx_participants_full_name ON participants (full_name);
CREATE INDEX idx_registrations_participant_id ON registrations (participant_id);
CREATE INDEX idx_registrations_status ON registrations (status);
CREATE INDEX idx_registrations_created_at ON registrations (created_at);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

INSERT INTO users (id, email, password_hash, role, created_at) VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'admin@example.com',
    '$2b$10$9ZbUiEQ/vvkzaTuOk1F9d.f4UxJrT77m43HXMSVB0yiIsAzc8POUO',
    'admin',
    '2026-09-01T08:00:00+00:00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'staff@example.com',
    '$2b$10$Vg/Qy2R0jU5eUuivR3EIuOTFBlv9VDrMN/Igtrt3g42th/G.OnING',
    'staff',
    '2026-09-02T08:00:00+00:00'
  );

INSERT INTO events (
  id, title, description, location, event_date, max_participants, status, created_by, created_at, updated_at
) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Summit Tech Casablanca',
    'Deux jours de talks produit, data et design pour les équipes tech.',
    'Anfa Place, Casablanca',
    '2026-11-12T09:30:00+00:00',
    120,
    'published',
    '11111111-1111-4111-8111-111111111111',
    '2026-09-05T10:00:00+00:00',
    '2026-09-20T10:00:00+00:00'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Atelier UX Marrakech',
    'Workshop intensif sur la recherche utilisateur et le prototypage.',
    'Médina Hub, Marrakech',
    '2026-10-22T14:00:00+00:00',
    40,
    'published',
    '22222222-2222-4222-8222-222222222222',
    '2026-09-10T08:00:00+00:00',
    '2026-09-18T08:00:00+00:00'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Concert Jazz Rabat',
    'Soirée jazz en plein air — encore en préparation (brouillon).',
    'Jardin d’Essais, Rabat',
    '2026-12-05T19:00:00+00:00',
    200,
    'draft',
    '22222222-2222-4222-8222-222222222222',
    '2026-09-18T12:00:00+00:00',
    '2026-09-18T12:00:00+00:00'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'Hackathon Agadir',
    '48h pour concevoir des solutions climat et tourisme durable.',
    'Cité de l’Innovation, Agadir',
    '2026-10-30T08:00:00+00:00',
    80,
    'published',
    '11111111-1111-4111-8111-111111111111',
    '2026-09-20T09:00:00+00:00',
    '2026-09-25T09:00:00+00:00'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'Conférence RH Tanger',
    'Annulée suite à un conflit de planning du lieu.',
    'Palais des Congrès, Tanger',
    '2026-10-08T09:00:00+00:00',
    60,
    'cancelled',
    '11111111-1111-4111-8111-111111111111',
    '2026-08-22T11:00:00+00:00',
    '2026-09-30T11:00:00+00:00'
  );

INSERT INTO participants (id, full_name, email, phone, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Sara Amrani', 'sara.amrani@example.com', '+212661100001', '2026-09-02T10:00:00+00:00', '2026-09-02T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Omar Benjelloun', 'omar.benjelloun@example.com', '+212661100002', '2026-09-03T10:00:00+00:00', '2026-09-03T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Lina Kadiri', 'lina.kadiri@example.com', NULL, '2026-09-04T10:00:00+00:00', '2026-09-04T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'Mehdi Chraibi', 'mehdi.chraibi@example.com', '+212661100004', '2026-09-05T10:00:00+00:00', '2026-09-05T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'Nadia El Fassi', 'nadia.elfassi@example.com', '+212661100005', '2026-09-06T10:00:00+00:00', '2026-09-06T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'Karim Tazi', 'karim.tazi@example.com', NULL, '2026-09-07T10:00:00+00:00', '2026-09-07T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb7', 'Inès Berrada', 'ines.berrada@example.com', '+212661100007', '2026-09-08T10:00:00+00:00', '2026-09-08T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8', 'Yassine Ouazzani', 'yassine.ouazzani@example.com', '+212661100008', '2026-09-09T10:00:00+00:00', '2026-09-09T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb9', 'Houda Mansouri', 'houda.mansouri@example.com', '+212661100009', '2026-09-11T10:00:00+00:00', '2026-09-11T10:00:00+00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb10', 'Anas Idrissi', 'anas.idrissi@example.com', '+212661100010', '2026-09-12T10:00:00+00:00', '2026-09-12T10:00:00+00:00');

-- 20 registrations. Draft event has none. Cancelled event only has cancelled rows.
-- Active (pending + confirmed) counts stay below each event max_participants.
INSERT INTO registrations (id, event_id, participant_id, status, created_at, updated_at) VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'confirmed', '2026-09-21T09:00:00+00:00', '2026-09-21T09:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc02', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'confirmed', '2026-09-21T09:10:00+00:00', '2026-09-21T09:10:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc03', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'pending',   '2026-10-06T08:15:00+00:00', '2026-10-06T08:15:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc04', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'confirmed', '2026-09-22T11:00:00+00:00', '2026-09-22T11:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc05', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'cancelled', '2026-09-22T12:00:00+00:00', '2026-09-28T12:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc06', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'confirmed', '2026-09-27T16:00:00+00:00', '2026-09-27T16:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc07', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'confirmed', '2026-09-23T08:00:00+00:00', '2026-09-23T08:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc08', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb7', 'pending',   '2026-10-06T09:20:00+00:00', '2026-10-06T09:20:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc09', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8', 'confirmed', '2026-09-24T10:00:00+00:00', '2026-09-24T10:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc10', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb9', 'confirmed', '2026-09-24T10:30:00+00:00', '2026-09-24T10:30:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc11', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb10', 'pending',   '2026-09-28T16:00:00+00:00', '2026-09-28T16:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc12', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'cancelled', '2026-09-23T08:20:00+00:00', '2026-09-29T08:20:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc13', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'confirmed', '2026-09-25T09:00:00+00:00', '2026-09-25T09:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc14', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'pending',   '2026-10-06T11:00:00+00:00', '2026-10-06T11:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc15', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6', 'confirmed', '2026-09-26T14:00:00+00:00', '2026-09-26T14:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc16', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb10', 'confirmed', '2026-09-26T14:20:00+00:00', '2026-09-26T14:20:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc17', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8', 'cancelled', '2026-09-26T15:00:00+00:00', '2026-09-30T15:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc18', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'cancelled', '2026-09-10T10:00:00+00:00', '2026-09-30T11:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc19', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'cancelled', '2026-09-10T10:10:00+00:00', '2026-09-30T11:00:00+00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccc20', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb7', 'cancelled', '2026-09-10T10:20:00+00:00', '2026-09-30T11:00:00+00:00');

COMMIT;
