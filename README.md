# Svelte (typescript), Slash DGraph, Firebase Auth, and Subscriptions (apollo web sockets)

![App](https://discuss-dgraph-io.s3.dualstack.us-west-1.amazonaws.com/original/2X/c/cd876438a01db400c9cffc85d545cc82d9651da2.png)

This app creates a firebase CRUD todo list next to a dgraph CRUD todo list...

Note: The firebase part of the code was taken from: https://github.com/fireship-io/182-svelte-firebase

See: https://fireship.io/lessons/svelte-v3-overview-firebase/

---
(Download the project, `npm i` then...)

1.) Create an **/src/config.json** file like the one here:

https://github.com/dgraph-io/graphql-sample-apps/blob/master/todo-react-firebase/src/config.json

There you will add you firebase config info along with your dgraph endpoint (without **https**):

https://slash.dgraph.io/

2.) Update your schema to the one in **schema.graphql**
Remember to update the AUDIENCE to your Firebase Project Name

3.) Deploy a firebase function like the one here:

https://github.com/dgraph-io/graphql-sample-apps/blob/master/todo-react-firebase/functions/index.js

(Note: this app uses the name *addAdminRole* instead of *addUserClaim*) - also change it in **src/firebase.ts** to whatever you like

4.) Make sure you have "Sign in With Google" enabled in Firebase... (Authentication -> Sign-in method)

5.) Also, check your rules for the test Firebase database:

```javascript
match /todos/{document=**} {
    allow read, write, create;
}
```
See above fireship.io above for firebase related questions.

Hopefully this gets you going.  If I forgot something about dgraph, post a question here:

https://discuss.dgraph.io/t/support-firebase-jwt-token-verification/9447/40

`npm run dev`