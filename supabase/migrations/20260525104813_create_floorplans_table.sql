/*
  # Create floorplans table

  1. New Tables
    - `floorplans`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `rooms` (jsonb, not null - stores the room layout data)
      - `canvas_width` (integer, default 700)
      - `canvas_height` (integer, default 500)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `floorplans` table
    - Add policy for authenticated users to manage their own floorplans
*/

CREATE TABLE IF NOT EXISTS floorplans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Floor Plan',
  rooms jsonb NOT NULL DEFAULT '[]'::jsonb,
  canvas_width integer NOT NULL DEFAULT 700,
  canvas_height integer NOT NULL DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE floorplans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read floorplans"
  ON floorplans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert floorplans"
  ON floorplans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update floorplans"
  ON floorplans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete floorplans"
  ON floorplans FOR DELETE
  TO authenticated
  USING (true);
