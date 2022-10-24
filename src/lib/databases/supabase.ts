import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Todo } from '$lib/todo.model';
import type { User } from '$lib/user.model';
import { createClient, type User as Supabase_User } from '@supabase/supabase-js';
import { authUser, realtime } from 'j-supabase';
import { readable, type Subscriber } from 'svelte/store';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const supabase_to_user = (i: Supabase_User): User => ({
    displayName: i.user_metadata['full_name'],
    email: i.email as string,
    uid: i.id,
    photoURL: i.user_metadata['avatar_url']
});

export class supabase_adapter {

    todos: Todo[] = [];

    private set!: Subscriber<Todo[]>;

    private updateTodos = () => this.set(this.todos);

    // auth class

    user = readable<User | null>(null, (set) => {
        return authUser(supabase).subscribe(user => {
            set(user ? supabase_to_user(user) : null);
        });
    });

    async loginWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) {
            console.error(error);
        }
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error(error);
        }
    }

    // todos

    getTodos(uid: string) {
        return readable<Todo[]>([], (set) => {
            this.set = set;
            return realtime<Todo>(supabase).from('todos').eq('uid', uid)
                .subscribe((snap) => {
                    if (snap.payload.eventType === 'INSERT') {
                        // get rid of optimistic insert
                        this.todos.pop();
                    }
                    this.todos = snap.data ? snap.data : [];
                    this.set(this.todos);
                })
        });
    }

    async addTodo(_uid: string, text: string) {

        // optimistic insert
        this.todos.push({ id: '0x', text, complete: false, createdAt: new Date() });
        this.updateTodos();

        // real add
        await supabase.from('todos').insert({ text });
    }

    async updateTodo(id: string, complete: boolean) {

        // optimistic update
        const rec = this.todos.find(r => r['id'] === id) as Todo;
        this.todos.splice(this.todos.findIndex(r => r['id'] === id), 1, { ...rec, complete } as Todo);
        this.updateTodos();

        // real update
        await supabase.from('todos').update({ complete }).eq('id', id);
    }

    async deleteTodo(id: string) {

        // optimistic delete
        this.todos.splice(this.todos.findIndex(r => r['id'] === id), 1);
        this.updateTodos();

        // real delete
        await supabase.from('todos').delete().eq('id', id);
    }
}