/* eslint-disable @typescript-eslint/no-explicit-any */
import { PUBLIC_FIREBASE_CONFIG } from '$env/static/public';
import { readable, type Subscriber } from 'svelte/store';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import type { User as FB_User } from 'firebase/auth';
import { getFirestore, onSnapshot } from 'firebase/firestore';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import type { User } from '$lib/user.model';
import type { Todo } from '$lib/todo.model';

// firebase app

const firebaseApp = getApps().length === 0 ? initializeApp(JSON.parse(PUBLIC_FIREBASE_CONFIG)) : getApp();

const firebase_to_user = (i: FB_User): User => ({
    displayName: i.displayName,
    email: i.email,
    uid: i.uid,
    photoURL: i.photoURL
});

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export class firebase_adapter {

    // auth

    loginWithGoogle = async () => await signInWithPopup(auth, new GoogleAuthProvider());

    logout = async () => await signOut(auth);

    user = readable<User | null>(
        null,
        (set: Subscriber<User | null>) =>
            onIdTokenChanged(auth, (u: FB_User | null) => {
                set(u ? firebase_to_user(u) : null);
            })
    );

    // todos

    getTodos = (uid: string) => readable<Todo[]>(
        [],
        (set: Subscriber<Todo[]>) =>
            onSnapshot<Todo[]>(
                query<Todo[]>(
                    collection(db, 'todos') as CollectionReference<Todo[]>,
                    where('uid', '==', uid),
                    orderBy('created')
                ), (q) => {
                    set(q.empty
                        ? []
                        : q.docs.map((doc) => ({ ...doc.data() as any, id: doc.id })) as Todo[]
                    );
                })
    );

    addTodo = async (uid: string, text: string) => await addDoc(collection(db, 'todos'), {
        uid,
        text,
        complete: false,
        created: serverTimestamp()
    });

    updateTodo = async (id: string, complete: boolean) => await updateDoc(doc(db, 'todos', id), { complete });

    deleteTodo = async (id: string) => await deleteDoc(doc(db, 'todos', id));
}