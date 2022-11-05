import { page } from '$app/stores';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Todo } from '$lib/todo.model';
import type { User } from '$lib/user.model';
import { createClient, type User as Supabase_User } from '@supabase/supabase-js';
import { authUser, realtime } from 'j-supabase';
import { get, readable, writable, type Writable } from 'svelte/store';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const supabase_to_user = (i: Supabase_User): User => ({
    displayName: i.user_metadata['full_name'],
    email: i.email as string,
    uid: i.id,
    photoURL: i.user_metadata['avatar_url']
});

export const supabase_auth_adapter = {

    user: readable<User | null>(null, (set) => {
        return authUser(supabase).subscribe(user => {
            set(user ? supabase_to_user(user) : null);
        });
    }),

    async loginWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: get(page).url.origin } });
        if (error) {
            console.error(error);
        }
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error(error);
        }
    }
}

export interface todo_adapter {
    getTodos: Writable<Todo[]>;
    addTodo: (text: string) => void;
    updateTodo: (id: string, complete: boolean) => void;
    deleteTodo: (id: string) => void;
}

export const supabase_todo_adapter = (uid: string): todo_adapter => {

    let todos: Todo[] = [];

    const { subscribe, set, update } = writable<Todo[]>([], set => {

        return realtime<Todo>(supabase).from('todos').eq('uid', uid)
            .subscribe(snap => {
                if (snap.payload.eventType === 'INSERT') {
                    // get rid of optimistic insert
                    todos.pop();
                }
                todos = snap.data ? snap.data : [];
                set(todos);
            });

    });

    return {
        getTodos: {
            set,
            update,
            subscribe,
        },
        addTodo: async (text: string) => {
            // optimistic insert
            todos.push({ id: '0x', text, complete: false, createdAt: new Date() });
            set(todos);

            // real add
            const { error } = await supabase.from('todos').insert({ text });
            if (error) {
                console.error(error);
            }
        },
        updateTodo: async (id: string, complete: boolean) => {

            // optimistic update
            const rec = todos.find(r => r['id'] === id) as Todo;
            todos.splice(todos.findIndex(r => r['id'] === id), 1, { ...rec, complete } as Todo);
            set(todos);

            // real update
            const { error } = await supabase.from('todos').update({ complete }).eq('id', id);
            if (error) {
                console.error(error);
            }
        },
        deleteTodo: async (id: string) => {

            // optimistic delete
            todos.splice(todos.findIndex(r => r['id'] === id), 1);
            set(todos);

            // real delete
            const { error } = await supabase.from('todos').delete().eq('id', id);
            if (error) {
                console.error(error);
            }
        }
    }
};





