*Looking for a shareable component template? Go here --> [sveltejs/component-template](https://github.com/sveltejs/component-template)*

---

# DGraph, GraphQL, Typescript, Firebase Auth, and Web Sockets

This app creates a firebase todo list next to a dgraph todo list...

Note: The firebase part of the code was taken from: https://github.com/fireship-io/182-svelte-firebase

See: https://fireship.io/lessons/svelte-v3-overview-firebase/

First create an **/src/config.json** file like the one here:

https://github.com/dgraph-io/graphql-sample-apps/blob/master/todo-react-firebase/src/config.json

There you will add you firebase config info along with your dgraph endpoint:

https://slash.dgraph.io/

Update your schema to the one in **schema.graphql**
Remember to update the AUDIENCE to your Firebase Project Name

You will also need a deployed firebase function like the one here:

https://github.com/dgraph-io/graphql-sample-apps/blob/master/todo-react-firebase/functions/index.js

(Note: this app uses the name *addAdminRole* instead of *addUserClaim*) - change it in **src/firebase.ts** to whatever you like

Make sure you have "Sign in With Google" enabled in Firebase... (Authentication -> Sign-in method)

Also, check your rules for the test Firebase database:

```javascript
match /todos/{document=**} {
    allow read, write, create;
}
```

Hopefully this gets you going.  If I forgot something, post a question here:

https://discuss.dgraph.io/t/authentication-with-firebase/11928/16
