
// -- Firebase --

import {
    _addTodo,
    _deleteTodo,
    _getTodos,
    _loginWithGoogle,
    _logout,
    _updateTodo,
    _user
} from './databases/firebase';


// auth

export const logout = _logout;
export const loginWithGoogle = _loginWithGoogle;
export const user = _user;

// todos

export const getTodos = _getTodos;
export const addTodo = _addTodo
export const deleteTodo = _deleteTodo;
export const updateTodo = _updateTodo;






