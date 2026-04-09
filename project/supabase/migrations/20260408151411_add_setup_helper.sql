/*
  # Add Setup Helper Function

  ## Purpose
  Creates a public RPC function to check if any admin users exist.
  This is used during the initial setup to determine if the app needs configuration.

  ## Security
  - Function is accessible without authentication (SECURITY DEFINER)
  - Only returns a boolean - no sensitive data exposed
*/

CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.has_any_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO authenticated;
