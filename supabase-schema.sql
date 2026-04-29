-- ======================================================
-- INKSPIRED — Multi-Vendor SaaS Marketplace Schema
-- Complete Supabase Database Setup with RLS
-- Version: 2.0 (Aligned with Frontend)
-- ======================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================
-- 1. PROFILES (extends auth.users)
-- ======================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'developer', 'admin')) DEFAULT 'customer',
  phone TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, is_email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile after user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ======================================================
-- 2. APPS (Products)
-- ======================================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_desc TEXT,
  category TEXT NOT NULL CHECK (category IN ('Design', 'Productivity', 'Writing', 'Marketing', 'Developer', 'Finance', 'Development', 'Photography', 'Music', 'Video', 'Utilities', 'Education')),
  tags TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
  version TEXT DEFAULT '1.0.0',
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INT DEFAULT 0,
  downloads INT DEFAULT 0,
  icon_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  requirements TEXT,
  compatibility TEXT,
  license_type TEXT DEFAULT 'Standard',
  support_email TEXT,
  documentation_url TEXT,
  video_url TEXT,
  download_url TEXT,
  size TEXT,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_apps_developer ON apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_rating ON apps(rating DESC);
CREATE INDEX IF NOT EXISTS idx_apps_downloads ON apps(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(is_featured) WHERE is_featured = true;

-- ======================================================
-- 3. ORDERS
-- ======================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ======================================================
-- 4. REVIEWS
-- ======================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_app ON reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);

-- ======================================================
-- 5. WISHLISTS
-- ======================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_app ON wishlists(app_id);

-- ======================================================
-- 6. DEVELOPER EARNINGS
-- ======================================================
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_developer ON earnings(developer_id);
CREATE INDEX IF NOT EXISTS idx_earnings_app ON earnings(app_id);
CREATE INDEX IF NOT EXISTS idx_earnings_created ON earnings(created_at DESC);

-- ======================================================
-- 7. COUPONS
-- ======================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_uses INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, valid_from, valid_until);

-- ======================================================
-- 8. DOWNLOAD HISTORY
-- ======================================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_app ON downloads(app_id);

-- ======================================================
-- FUNCTIONS & TRIGGERS
-- ======================================================

-- Update app average rating when reviews change
CREATE OR REPLACE FUNCTION update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE apps 
    SET 
      rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM reviews 
        WHERE app_id = NEW.app_id AND is_approved = true
      ), 0),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE app_id = NEW.app_id AND is_approved = true
      )
    WHERE id = NEW.app_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE apps 
    SET 
      rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM reviews 
        WHERE app_id = OLD.app_id AND is_approved = true
      ), 0),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE app_id = OLD.app_id AND is_approved = true
      )
    WHERE id = OLD.app_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_rating_update ON reviews;
CREATE TRIGGER reviews_rating_update
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_app_rating();

-- Increment download count when order is completed
CREATE OR REPLACE FUNCTION increment_app_downloads()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE apps 
    SET downloads = downloads + COALESCE((item->>'qty')::int, 1)
    FROM jsonb_array_elements(NEW.items) AS item
    WHERE apps.id = (item->>'id')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_download_increment ON orders;
CREATE TRIGGER orders_download_increment
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION increment_app_downloads();

-- Create earnings entry when order is paid
CREATE OR REPLACE FUNCTION create_earnings()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  item_price DECIMAL(10,2);
  item_qty INT;
  platform_fee DECIMAL(10,2);
  developer_amount DECIMAL(10,2);
  app_developer_id UUID;
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      item_price := COALESCE((item->>'price')::decimal, 0);
      item_qty := COALESCE((item->>'qty')::int, 1);
      
      SELECT developer_id INTO app_developer_id 
      FROM apps 
      WHERE id = (item->>'id')::uuid;
      
      IF app_developer_id IS NOT NULL THEN
        platform_fee := item_price * 0.20; -- 20% platform fee
        developer_amount := item_price - platform_fee;
        
        INSERT INTO earnings (developer_id, app_id, order_id, amount, platform_fee, net_amount)
        VALUES (
          app_developer_id,
          (item->>'id')::uuid,
          NEW.id,
          item_price * item_qty,
          platform_fee * item_qty,
          developer_amount * item_qty
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_earnings_creation ON orders;
CREATE TRIGGER orders_earnings_creation
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION create_earnings();

-- ======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, edit own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Apps: Approved apps are public, devs can manage own, admins full access
CREATE POLICY "Approved apps are viewable by everyone" ON apps
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Developers can view own draft apps" ON apps
  FOR SELECT USING (auth.uid() = developer_id);

CREATE POLICY "Developers can insert own apps" ON apps
  FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update own apps" ON apps
  FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete own apps" ON apps
  FOR DELETE USING (auth.uid() = developer_id);

CREATE POLICY "Admins can manage all apps" ON apps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: Customers own orders, admins full access
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reviews: Public read for approved apps, authenticated write own
CREATE POLICY "Reviews for approved apps are viewable" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apps 
      WHERE apps.id = reviews.app_id 
      AND apps.status = 'approved'
    )
  );

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Wishlists: Users manage own
CREATE POLICY "Users manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Earnings: Developers own, admins full
CREATE POLICY "Developers view own earnings" ON earnings
  FOR SELECT USING (auth.uid() = developer_id);

CREATE POLICY "Admins view all earnings" ON earnings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Coupons: Public read, admin write
CREATE POLICY "Coupons are viewable by everyone" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Admins manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Downloads: Users own, admins full
CREATE POLICY "Users view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all downloads" ON downloads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- STORAGE BUCKETS
-- ======================================================

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-icons', 'app-icons', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-screenshots', 'app-screenshots', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Allow public read access to all buckets
CREATE POLICY "Public can view app icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-icons');

CREATE POLICY "Public can view screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-screenshots');

CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow developers to upload app icons/screenshots for their apps
CREATE POLICY "Developers can upload app icons" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-icons' AND auth.uid() IN (
      SELECT developer_id FROM apps WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Developers can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'app-screenshots' AND auth.uid() IN (
      SELECT developer_id FROM apps WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Allow developers to update/delete their own app assets
CREATE POLICY "Developers can manage app icons" ON storage.objects
  FOR ALL USING (
    bucket_id = 'app-icons' AND auth.uid() IN (
      SELECT developer_id FROM apps WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Developers can manage screenshots" ON storage.objects
  FOR ALL USING (
    bucket_id = 'app-screenshots' AND auth.uid() IN (
      SELECT developer_id FROM apps WHERE id::text = (storage.foldername(name))[1]
    )
  );

-- Admins can manage all storage
CREATE POLICY "Admins can manage all storage" ON storage.objects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- INITIAL DATA (Optional)
-- ======================================================

-- Sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_uses, valid_until)
VALUES ('WELCOME10', '10% off for new customers', 'percentage', 10.00, 500.00, 1000, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

COMMIT;

