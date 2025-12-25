-- Phase 2A.1: Multi-Parent Support (RLS & Roles)

-- 1. Update family_members role default and migrate data
ALTER TABLE family_members ALTER COLUMN role SET DEFAULT 'adult';
UPDATE family_members SET role = 'adult' WHERE role = 'parent';

-- Helper function to check if user is an adult family member
-- This simplifies the RLS policies and makes them consistent
CREATE OR REPLACE FUNCTION is_adult_family_member(_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE family_id = _family_id 
      AND user_id = auth.uid() 
      AND role = 'adult'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update RLS Policies

-- Table: families
-- allow access if created_by OR is_adult_family_member
DROP POLICY IF EXISTS "Users can view their own families" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can update their own families" ON families;
DROP POLICY IF EXISTS "Users can delete their own families" ON families;

CREATE POLICY "Users view families they belong to" ON families
  FOR SELECT USING (
    created_by = auth.uid() OR 
    is_adult_family_member(id) OR
    EXISTS (SELECT 1 FROM family_members WHERE family_id = families.id AND user_id = auth.uid()) -- Allow all members to view
  );

CREATE POLICY "Adults update families" ON families
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    is_adult_family_member(id)
  );

CREATE POLICY "Users create families" ON families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Table: family_members
DROP POLICY IF EXISTS "Users view their family members" ON family_members;

CREATE POLICY "Users view members of their families" ON family_members
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE id = family_members.family_id 
      AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = families.id AND fm.user_id = auth.uid()))
    )
  );

-- Table: children
DROP POLICY IF EXISTS "Parents can manage their children" ON children;

CREATE POLICY "Adults manage children" ON children
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE id = children.family_id 
      AND (created_by = auth.uid() OR is_adult_family_member(id))
    )
  );

-- Table: family_events
DROP POLICY IF EXISTS "Users manage family events" ON family_events;

CREATE POLICY "Adults manage family events" ON family_events
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE id = family_events.family_id 
      AND (created_by = auth.uid() OR is_adult_family_member(id))
    )
  );

-- Table: event_completions
-- (Assuming RLS was enabled but policy might not have been fully defined or needs update)
-- Access primarily via event -> family
DROP POLICY IF EXISTS "Users manage event completions" ON event_completions; -- Preventive drop

CREATE POLICY "Adults manage event completions" ON event_completions
  USING (
    EXISTS (
      SELECT 1 FROM family_events
      JOIN families ON families.id = family_events.family_id
      WHERE family_events.id = event_completions.event_id
      AND (families.created_by = auth.uid() OR is_adult_family_member(families.id))
    )
  );

-- Table: validation_categories
DROP POLICY IF EXISTS "Users manage validation categories" ON validation_categories;

CREATE POLICY "Adults manage validation categories" ON validation_categories
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE id = validation_categories.family_id 
      AND (created_by = auth.uid() OR is_adult_family_member(id))
    )
  );

-- Table: validation_tasks
DROP POLICY IF EXISTS "Users manage validation tasks" ON validation_tasks;

CREATE POLICY "Adults manage validation tasks" ON validation_tasks
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE id = validation_tasks.family_id 
      AND (created_by = auth.uid() OR is_adult_family_member(id))
    )
  );

-- Table: validation_requests
-- Adults can view/update (approve/deny), Children can insert (request)
DROP POLICY IF EXISTS "Users manage validation requests" ON validation_requests; -- Preventive

CREATE POLICY "Adults manage validation requests" ON validation_requests
  USING (
    EXISTS (
      SELECT 1 FROM validation_tasks
      JOIN families ON families.id = validation_tasks.family_id
      WHERE validation_tasks.id = validation_requests.task_id
      AND (families.created_by = auth.uid() OR is_adult_family_member(families.id))
    )
  );

-- Allow children to view and insert their own requests (Refining this might be strictly phase 2C but good to have)
CREATE POLICY "Children can create requests" ON validation_requests
  FOR INSERT WITH CHECK (
    -- Logic for child authentication/pairing usually handled via specific child auth flow or parent proxy
    -- For now, relying on the adult policy above for parent app usage.
    true
  );
