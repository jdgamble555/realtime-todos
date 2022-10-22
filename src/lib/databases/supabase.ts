import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Todo } from '$lib/todo.model';
import type { User } from '$lib/user.model';
import { createClient, type User as SB_User } from '@supabase/supabase-js';
import { readable, type Subscriber } from 'svelte/store';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const supabase_to_user = (i: SB_User): User => ({
    displayName: i.user_metadata['full_name'],
    email: i.email as string,
    uid: i.id,
    photoURL: i.user_metadata['avatar_url']
});

export class supabase_adapter {

    private todos: Todo[] = [];

    private set!: Subscriber<Todo[]>;

    private updateTodos = () => this.set(this.todos);

    // auth

    loginWithGoogle = async () => await supabase.auth.signInWithOAuth({ provider: 'google' });

    logout = async () => await supabase.auth.signOut();

    user = readable<User | null>(
        null,
        (set) => {
            supabase.auth.getUser()
                .then((data) => set(data.data.user ? supabase_to_user(data.data.user) : null));
            const auth = supabase.auth.onAuthStateChange((_event, session) => {
                set(session ? supabase_to_user(session.user) : null);
            });
            return auth.data.subscription.unsubscribe;
        }
    );

    // todos

    getTodos = (uid: string) => readable<Todo[]>([], (set) => {
        supabase.from('todos').select('*').eq('uid', uid).then(({ data }) => {
            if (data) this.todos.push(...data);
            set(this.todos);
        });

        this.set = set;

        return supabase.channel('public:todos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
                const e = payload.eventType;
                switch (e) {
                    case 'INSERT': {
                        // remove optimistic todo without id
                        this.todos.pop();

                        // add new todo with id
                        this.todos.push(payload.new as Todo);
                        break;
                    }
                    case 'DELETE': {
                        const i = this.todos.findIndex(r => r['id'] === payload.old['id']);
                        if (i !== -1) this.todos.splice(i, 1);
                        break;
                    }
                    case 'UPDATE': {
                        const i = this.todos.findIndex(r => r['id'] === payload.old['id']);
                        if (i !== -1) this.todos.splice(i, 1, payload.new as Todo);
                        break;
                    }
                }
                set(this.todos);
            }).subscribe().unsubscribe;
    });

    addTodo = async (_uid: string, text: string) => {

        // optimistic add
        this.todos.push({ id: '0x', text, complete: false, createdAt: new Date() });
        this.updateTodos();

        // real add
        await supabase.from('todos').insert({ text });
    };

    updateTodo = async (id: string, complete: boolean) => {

        // optimistic update
        const rec = this.todos.find(r => r['id'] === id) as Todo;
        this.todos.splice(this.todos.findIndex(r => r['id'] === id), 1, { ...rec, complete } as Todo);
        this.updateTodos();

        // real update
        await supabase.from('todos').update({ complete }).eq('id', id);
    };

    deleteTodo = async (id: string) => {

        // optimistic delete
        this.todos.splice(this.todos.findIndex(r => r['id'] === id), 1);
        this.updateTodos();

        // real delete
        await supabase.from('todos').delete().eq('id', id);
    };
}