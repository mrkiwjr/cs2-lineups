-- ============================================================
-- CS2 Lineups — Full initial schema
-- ============================================================

-- -------------------- PROFILES --------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username   TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------- LINEUPS --------------------
CREATE TABLE IF NOT EXISTS lineups (
  id          SERIAL PRIMARY KEY,
  map         TEXT NOT NULL CHECK (map IN ('mirage','inferno','dust2','nuke','anubis','ancient','overpass')),
  side        TEXT NOT NULL CHECK (side IN ('T','CT')),
  type        TEXT NOT NULL CHECK (type IN ('smoke','flash','molotov','he')),
  name        TEXT NOT NULL,
  "from"      TEXT NOT NULL,
  "to"        TEXT NOT NULL,
  throw_type  TEXT NOT NULL CHECK (throw_type IN ('normal','jumpthrow','runthrow','walkthrow')),
  description TEXT NOT NULL DEFAULT '',
  video       TEXT NOT NULL DEFAULT '',
  video_url   TEXT NOT NULL DEFAULT '',
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  author_id   UUID REFERENCES auth.users ON DELETE SET NULL,
  is_seed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lineups_map           ON lineups (map);
CREATE INDEX idx_lineups_map_type_side ON lineups (map, type, side);
CREATE INDEX idx_lineups_author_id     ON lineups (author_id);

-- -------------------- FAVORITES --------------------
CREATE TABLE IF NOT EXISTS favorites (
  user_id   UUID    NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  lineup_id INTEGER NOT NULL REFERENCES lineups    ON DELETE CASCADE,
  PRIMARY KEY (user_id, lineup_id)
);

CREATE INDEX idx_favorites_lineup_id ON favorites (lineup_id);

-- -------------------- LINEUP VIEWS --------------------
CREATE TABLE IF NOT EXISTS lineup_views (
  id        SERIAL PRIMARY KEY,
  lineup_id INTEGER      NOT NULL REFERENCES lineups ON DELETE CASCADE,
  viewer_ip TEXT         NOT NULL,
  user_id   UUID         REFERENCES auth.users ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_lineup_views_unique ON lineup_views (lineup_id, viewer_ip);
CREATE INDEX idx_lineup_views_lineup_id     ON lineup_views (lineup_id);

-- -------------------- COMMENTS --------------------
CREATE TABLE IF NOT EXISTS comments (
  id        SERIAL PRIMARY KEY,
  lineup_id INTEGER     NOT NULL REFERENCES lineups    ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  text      TEXT        NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_lineup_id ON comments (lineup_id);

-- -------------------- MAP POSITIONS --------------------
CREATE TABLE IF NOT EXISTS map_positions (
  map  TEXT     NOT NULL,
  name TEXT     NOT NULL,
  x    SMALLINT NOT NULL,
  y    SMALLINT NOT NULL,
  PRIMARY KEY (map, name)
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW lineup_favorites_count AS
SELECT lineup_id, COUNT(*) AS count
FROM favorites
GROUP BY lineup_id;

CREATE OR REPLACE VIEW lineup_view_count AS
SELECT lineup_id, COUNT(*) AS count
FROM lineup_views
GROUP BY lineup_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_positions ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ---------- lineups ----------
CREATE POLICY "lineups_select" ON lineups
  FOR SELECT USING (true);

CREATE POLICY "lineups_insert" ON lineups
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "lineups_update" ON lineups
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "lineups_delete" ON lineups
  FOR DELETE USING (auth.uid() = author_id);

-- ---------- favorites ----------
CREATE POLICY "favorites_select" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ---------- lineup_views ----------
CREATE POLICY "lineup_views_select" ON lineup_views
  FOR SELECT USING (true);

CREATE POLICY "lineup_views_insert" ON lineup_views
  FOR INSERT WITH CHECK (true);

-- ---------- comments ----------
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ---------- map_positions ----------
CREATE POLICY "map_positions_select" ON map_positions
  FOR SELECT USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'user_name', NEW.raw_user_meta_data ->> 'name', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER lineups_updated_at
  BEFORE UPDATE ON lineups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
