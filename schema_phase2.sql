
-- Phase 2: Working Hours Table
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday
  is_closed BOOLEAN DEFAULT false,
  open_time TIME,
  close_time TIME,
  UNIQUE(day_of_week)
);

ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view working hours" ON working_hours FOR SELECT USING (true);
CREATE POLICY "Admins can manage working hours" ON working_hours FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Insert default hours (10:00 to 22:00 every day)
INSERT INTO working_hours (day_of_week, open_time, close_time) VALUES
(0, '10:00', '22:00'),
(1, '10:00', '22:00'),
(2, '10:00', '22:00'),
(3, '10:00', '22:00'),
(4, '10:00', '22:00'),
(5, '10:00', '22:00'),
(6, '10:00', '22:00');
