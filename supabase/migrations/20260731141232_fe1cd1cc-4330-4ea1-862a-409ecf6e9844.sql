-- ============ enums ============
CREATE TYPE public.app_role AS ENUM ('admin','operator','customer');
CREATE TYPE public.txn_status AS ENUM ('pending','success','failed');

-- ============ shared helpers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile TEXT UNIQUE,
  name TEXT,
  email TEXT,
  stb_id TEXT,
  operator_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ user roles ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','operator'))
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- new user -> profile + customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, mobile, name, email, stb_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'mobile',
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'stb_id'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ plans ============
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  validity_days INTEGER NOT NULL DEFAULT 30,
  category TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  channels INTEGER,
  popular BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans staff write" ON public.plans FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ products ============
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products staff write" ON public.products FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ stb accounts ============
CREATE TABLE public.stb_accounts (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Customer',
  customer_mobile TEXT,
  current_plan TEXT,
  expiry TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.stb_accounts TO authenticated;
GRANT ALL ON public.stb_accounts TO service_role;
ALTER TABLE public.stb_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stb read" ON public.stb_accounts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "stb insert" ON public.stb_accounts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "stb update" ON public.stb_accounts FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER trg_stb_updated BEFORE UPDATE ON public.stb_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ transactions ============
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stb_id TEXT,
  plan_id TEXT,
  plan_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status public.txn_status NOT NULL DEFAULT 'pending',
  customer_name TEXT,
  customer_mobile TEXT,
  coupon TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "txn read" ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "txn insert" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "txn update" ON public.transactions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "txn delete" ON public.transactions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_txn_updated BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ product requests ============
CREATE TABLE public.product_requests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stb_id TEXT,
  customer_name TEXT,
  customer_mobile TEXT,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'accessory',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  technician_name TEXT,
  technician_mobile TEXT,
  scheduled_date TEXT,
  operator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_requests TO authenticated;
GRANT ALL ON public.product_requests TO service_role;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr read" ON public.product_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "pr insert" ON public.product_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "pr update" ON public.product_requests FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "pr delete" ON public.product_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_pr_updated BEFORE UPDATE ON public.product_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ complaints ============
CREATE TABLE public.complaints (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stb_id TEXT,
  customer_name TEXT,
  customer_mobile TEXT,
  category TEXT NOT NULL,
  issue_type TEXT,
  description TEXT,
  media_url TEXT,
  preferred_time TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  technician_name TEXT,
  technician_mobile TEXT,
  assigned_at TIMESTAMPTZ,
  expected_arrival TEXT,
  resolved_at TIMESTAMPTZ,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cmp read" ON public.complaints FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "cmp insert" ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cmp update" ON public.complaints FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "cmp delete" ON public.complaints FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_cmp_updated BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ approved operators ============
CREATE TABLE public.approved_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL UNIQUE,
  name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.approved_operators TO authenticated;
GRANT ALL ON public.approved_operators TO service_role;
ALTER TABLE public.approved_operators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ao read" ON public.approved_operators FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "ao write" ON public.approved_operators FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ao_updated BEFORE UPDATE ON public.approved_operators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ blocked customers ============
CREATE TABLE public.blocked_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.blocked_customers TO authenticated;
GRANT ALL ON public.blocked_customers TO service_role;
ALTER TABLE public.blocked_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bc read" ON public.blocked_customers FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "bc write" ON public.blocked_customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ realtime ============
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.product_requests REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.stb_accounts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stb_accounts;

-- ============ seed catalogue ============
INSERT INTO public.plans (id,name,price,validity_days,category,features,channels,popular) VALUES
 ('m1','Basic Tamil Pack Monthly Rs 220',220,30,'Monthly','{"150+ SD Channels","Standard Definition","1 STB"}',150,false),
 ('m2','Basic Tamil Silver Pack Monthly Rs 240',240,30,'Monthly','{"300+ HD Channels","Full HD Quality","OTT App bundle"}',300,true),
 ('m3','Basic Tamil HD Packs Rs 300',300,30,'Monthly','{"400+ Channels","4K where available","3 months validity"}',400,false),
 ('c1','Sports Pack Rs 49',49,30,'Channels','{"Star Sports HD","Sony Sports","Willow Cricket"}',18,false),
 ('c2','HD Movies Pack Rs 79',79,30,'Channels','{"Star Movies","&pictures HD","Sony Pix"}',22,false),
 ('c3','Kids Pack Rs 49',49,30,'Channels','{"Cartoon Network","Nick HD+","Disney"}',12,false),
 ('a1','OTT Add-on (Hotstar)',99,30,'Add-on','{"Disney+ Hotstar Mobile","1 device"}',NULL,false),
 ('a2','Regional Bhasha Pack',59,30,'Add-on','{"25+ regional channels"}',NULL,false);

INSERT INTO public.products (id,name,category,price,available_stock,description) VALUES
 ('p1','HDMI Cable','accessory',150,15,'High-speed 1.5m 4K HDMI cable for crisp video & clear audio.'),
 ('p2','AV Cable','accessory',100,12,'3-RCA Red White Yellow Audio-Video Cable.'),
 ('p3','Remote Control','accessory',250,15,'Universal STB Remote with learning keys.'),
 ('p4','STB Adapter / Power Supply','accessory',200,8,'12V 1.5A original STB power adapter.'),
 ('p5','Set Top Box Replacement','accessory',799,4,'HD Digital STB unit swap with warranty.'),
 ('p6','Dish Cable','accessory',180,25,'Heavy-duty RG6 Coaxial cable (per 10 meters).'),
 ('p7','Connector','accessory',40,50,'F-type waterproof coaxial cable connector pack.'),
 ('p8','Splitter','accessory',120,18,'2-Way Signal Splitter for multi-connection.'),
 ('p9','Other Accessories','accessory',150,20,'Wall brackets, clip sets, and cable ties.'),
 ('s1','New STB Installation','service',350,99,'Full new connection setup with dish alignment & box activation.'),
 ('s2','Cable Replacement','service',200,99,'Inspection and re-wiring of old RG6 co-axial cables.'),
 ('s3','Extra Connection Request','service',500,99,'Multi-TV extension installation with secondary box.'),
 ('s4','STB Replacement Installation','service',300,99,'On-site swapping and re-configuration of replacement STB.'),
 ('s5','HDMI/AV Setup','service',150,99,'TV display calibration and audio output configuration.');