"""
Supabase Database Setup Script

This script creates all the necessary tables in Supabase for the Enterprise Workflow Copilot.
Run this once to set up your database.
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

# SQL to create all tables
CREATE_TABLES_SQL = """
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

-- Create permissive policies for service role (backend)
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.organizations FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.organization_members FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.workflows FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.workflow_steps FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.comments FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access" ON public.activity_logs FOR ALL USING (true);
"""

def execute_sql(sql: str) -> dict:
    """Execute SQL via Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json={"query": sql}, headers=headers)
    return response

def create_tables_via_sql_editor():
    """
    Unfortunately, Supabase REST API doesn't support direct SQL execution.
    We need to use the Supabase Management API or run SQL in the dashboard.
    
    This function will print the SQL for manual execution.
    """
    print("=" * 60)
    print("SUPABASE TABLE CREATION")
    print("=" * 60)
    print()
    print("The tables need to be created via Supabase Dashboard SQL Editor.")
    print()
    print("Steps:")
    print("1. Go to: https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Click 'SQL Editor' in the left sidebar")
    print("4. Create a new query")
    print("5. Paste the SQL below and run it")
    print()
    print("=" * 60)
    print("COPY THIS SQL:")
    print("=" * 60)
    print()
    print(CREATE_TABLES_SQL)
    print()
    print("=" * 60)
    
    # Save SQL to a file for easy copying
    sql_file = os.path.join(os.path.dirname(__file__), "supabase_schema.sql")
    with open(sql_file, "w") as f:
        f.write(CREATE_TABLES_SQL)
    print(f"SQL also saved to: {sql_file}")
    print("=" * 60)

if __name__ == "__main__":
    create_tables_via_sql_editor()
