CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS "authenticated all services" ON public.services;
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated all clients" ON public.clients;
CREATE POLICY "admins manage clients" ON public.clients FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated all hours" ON public.business_hours;
CREATE POLICY "admins manage hours" ON public.business_hours FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated all photos" ON public.photos;
CREATE POLICY "admins manage photos" ON public.photos FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated all appointments" ON public.appointments;
CREATE POLICY "admins manage appointments" ON public.appointments FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "public create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
CREATE POLICY "public create valid appointments" ON public.appointments FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(client_name)) BETWEEN 2 AND 120
  AND length(btrim(phone)) BETWEEN 8 AND 30
  AND date >= CURRENT_DATE
  AND date <= CURRENT_DATE + 365
  AND status = 'booked'
  AND package_paid = false
  AND (service_id IS NOT NULL OR package_id IS NOT NULL)
);

DROP POLICY IF EXISTS "authenticated all financial transactions" ON public.financial_transactions;
CREATE POLICY "admins manage financial transactions" ON public.financial_transactions FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated all membership packages" ON public.membership_packages;
CREATE POLICY "admins manage membership packages" ON public.membership_packages FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated manage settings" ON public.business_settings;
CREATE POLICY "admins manage settings" ON public.business_settings FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "public read settings" ON public.business_settings;
CREATE POLICY "public read singleton settings" ON public.business_settings FOR SELECT TO anon, authenticated
USING (id = true);

DROP POLICY IF EXISTS "authenticated all package_subscriptions" ON public.package_subscriptions;
CREATE POLICY "admins manage package subscriptions" ON public.package_subscriptions FOR ALL TO authenticated
USING (public.has_role((SELECT auth.uid()), 'admin'))
WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

DROP POLICY IF EXISTS "authenticated upload barbearia photos" ON storage.objects;
CREATE POLICY "admins upload barbearia photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'barbearia-fotos'
  AND public.has_role((SELECT auth.uid()), 'admin')
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "authenticated update barbearia photos" ON storage.objects;
CREATE POLICY "admins update own barbearia photos" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'barbearia-fotos'
  AND public.has_role((SELECT auth.uid()), 'admin')
  AND owner_id = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'barbearia-fotos'
  AND public.has_role((SELECT auth.uid()), 'admin')
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "authenticated delete barbearia photos" ON storage.objects;
CREATE POLICY "admins delete own barbearia photos" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'barbearia-fotos'
  AND public.has_role((SELECT auth.uid()), 'admin')
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "public read barbearia photos" ON storage.objects;