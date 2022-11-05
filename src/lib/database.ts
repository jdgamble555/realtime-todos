// -- Supabase --

import { supabase_todo_adapter, supabase_auth_adapter } from './databases/supabase';

export const db = supabase_todo_adapter;

export const auth = supabase_auth_adapter;

