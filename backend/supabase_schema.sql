-- Supabase Schema for Enterprise Workflow Copilot
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members (many-to-many)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to UUID REFERENCES public.users(id),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_org ON public.workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON public.workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_steps_workflow ON public.workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_comments_workflow ON public.comments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_activity_org ON public.activity_logs(organization_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (allows backend to access all data)
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
DROP POLICY IF EXISTS "Service role full access organizations" ON public.organizations;
DROP POLICY IF EXISTS "Service role full access organization_members" ON public.organization_members;
DROP POLICY IF EXISTS "Service role full access workflows" ON public.workflows;
DROP POLICY IF EXISTS "Service role full access workflow_steps" ON public.workflow_steps;
DROP POLICY IF EXISTS "Service role full access comments" ON public.comments;
DROP POLICY IF EXISTS "Service role full access activity_logs" ON public.activity_logs;

CREATE POLICY "Service role full access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Service role full access organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Service role full access organization_members" ON public.organization_members FOR ALL USING (true);
CREATE POLICY "Service role full access workflows" ON public.workflows FOR ALL USING (true);
CREATE POLICY "Service role full access workflow_steps" ON public.workflow_steps FOR ALL USING (true);
CREATE POLICY "Service role full access comments" ON public.comments FOR ALL USING (true);
CREATE POLICY "Service role full access activity_logs" ON public.activity_logs FOR ALL USING (true);

-- Insert a default organization (optional but helpful for testing)
INSERT INTO public.organizations (id, name, description) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'Default organization for new users')
ON CONFLICT (id) DO NOTHING;
