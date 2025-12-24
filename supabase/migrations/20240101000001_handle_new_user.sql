-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, created_at, updated_at)
  VALUES (new.id, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users to fix the current error for signed-up users
INSERT INTO public.users (id, created_at, updated_at)
SELECT id, created_at, CASE WHEN last_sign_in_at IS NULL THEN created_at ELSE last_sign_in_at END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
