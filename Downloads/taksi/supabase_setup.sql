-- =============================================
-- TaxiUz SQL Setup - ПОЛНЫЙ СБРОС И ПЕРЕСОЗДАНИЕ
-- Запустите ЭТО в Supabase SQL Editor
-- =============================================

-- Удаляем старые таблицы
DROP TABLE IF EXISTS driver_applications CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Таблица пользователей (с паролем)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  city TEXT DEFAULT 'Toshkent',
  status TEXT DEFAULT 'Aktiv',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE users TO anon;
GRANT ALL ON SEQUENCE users_id_seq TO anon;

-- 2. Таблица водителей
CREATE TABLE drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  car TEXT,
  rating NUMERIC DEFAULT 4.8,
  trips_count INT DEFAULT 0,
  status TEXT DEFAULT 'Online',
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE drivers TO anon;
GRANT ALL ON SEQUENCE drivers_id_seq TO anon;

-- 3. Таблица поездок
CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  user_name TEXT,
  user_phone TEXT,
  from_location TEXT,
  to_location TEXT,
  tariff TEXT DEFAULT 'Ekonom',
  pay_method TEXT DEFAULT 'Naqd pul',
  distance_km NUMERIC,
  price NUMERIC,
  comment TEXT,
  status TEXT DEFAULT 'Jarayonda',
  driver_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE trips TO anon;
GRANT ALL ON SEQUENCE trips_id_seq TO anon;

-- 4. Заявки водителей
CREATE TABLE driver_applications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT DEFAULT 'Toshkent',
  has_car BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'Kutilmoqda',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_applications DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE driver_applications TO anon;
GRANT ALL ON SEQUENCE driver_applications_id_seq TO anon;

-- 5. Демо-водители
INSERT INTO drivers (name, phone, car, rating, trips_count, status) VALUES
  ('Bobur Toshmatov', '+998901234567', 'Chevrolet Nexia 3', 4.9, 1240, 'Online'),
  ('Jasur Karimov',   '+998901234568', 'Chevrolet Cobalt',  4.8, 980,  'Online'),
  ('Sherzod Aliyev',  '+998901234569', 'Chevrolet Spark',   4.7, 765,  'Online');
