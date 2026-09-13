CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Table: equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Table: difficulties
CREATE TABLE difficulties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Table: movement_patterns
CREATE TABLE movement_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Table: muscles
CREATE TABLE muscles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  region TEXT
);

-- Table: exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  instructions JSONB DEFAULT '[]',
  tips JSONB DEFAULT '[]',
  mistakes JSONB DEFAULT '[]',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  difficulty_id UUID REFERENCES difficulties(id) ON DELETE SET NULL,
  primary_muscle_id UUID REFERENCES muscles(id) ON DELETE SET NULL,
  movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL,
  calories INTEGER,
  duration INTEGER,
  reps TEXT,
  sets TEXT,
  rest_seconds INTEGER,
  animation_url TEXT,
  thumbnail_url TEXT,
  is_compound BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: exercise_secondary_muscles
CREATE TABLE exercise_secondary_muscles (
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_id UUID REFERENCES muscles(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, muscle_id)
);

-- Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_modtime
BEFORE UPDATE ON exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_exercises_category ON exercises(category_id);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_id);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_id);
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle_id);
CREATE INDEX idx_exercises_movement_pattern ON exercises(movement_pattern_id);
CREATE INDEX idx_exercises_is_compound ON exercises(is_compound);
CREATE INDEX idx_exercises_slug ON exercises(slug);
