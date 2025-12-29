-- Fix recursive RLS policies between families and family_members

-- 1. Create a secure function to check family access without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.has_family_access(_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user created the family (Direct table access bypasses RLS in SECURITY DEFINER)
    IF EXISTS (
        SELECT 1 FROM public.families 
        WHERE id = _family_id 
        AND created_by = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if user is a member (Direct table access bypasses RLS in SECURITY DEFINER)
    IF EXISTS (
        SELECT 1 FROM public.family_members 
        WHERE family_id = _family_id 
        AND user_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update family_members policy to use the secure function
-- This breaks the recursion because the function enters a "privileged" mode 
-- where it reads the tables directly without triggering their RLS policies.
DROP POLICY IF EXISTS "Users view members of their families" ON public.family_members;

CREATE POLICY "Users view members of their families" ON public.family_members
  FOR SELECT USING (
    has_family_access(family_id)
  );

-- 3. Ensure families policy is also robust (though the previous one might have been fine if family_members was fixed)
-- We can leave the families policy as is, or optimize it. 
-- The recursion was families -> family_members -> families.
-- Now it is families -> family_members -> has_family_access() -> [direct table read]
-- The loop is broken.
