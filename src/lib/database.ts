// -- Supabase --

import { firebase_auth_adapter, firebase_todo_adapter } from './databases/firebase';
//import { supabase_todo_adapter, supabase_auth_adapter } from './databases/supabase';

export const db = firebase_todo_adapter;
export const auth = firebase_auth_adapter;
