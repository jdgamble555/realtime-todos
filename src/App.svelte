<script lang="ts">
  import { client } from "./apollo";
  import { mutation, setClient } from "svelte-apollo";
  import Tasks from "./Tasks.svelte";
  import Profile from "./Profile.svelte";
  import Todos from "./Todos.svelte";
  import URL from "./URL.svelte";
  import { auth, googleProvider } from "./firebase";
  import { authState } from "rxfire/auth";
  import { ADD_USER } from "./queries";

  interface User {
    displayName: string;
    photoURL: string;
    uid: string;
    email: string;
  }

  let user: User;

  authState(auth).subscribe(async (u: any) => {
    if (u) {
      user = u;
    }
  });

  setClient(client);

  const addUser = mutation(ADD_USER);

  function login() {
    auth.signInWithPopup(googleProvider).then(async (result) => {
      // if first login, create user
      if (result.additionalUserInfo.isNewUser) {
        await createUser(result.user);
      }
    });
  }

  async function createUser(u: any) {
    try {
      await addUser({
        variables: {
          user: {
            username: u.email,
            name: u.displayName,
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
</script>

<section>
  {#if user}
    <Profile
      displayName={user.displayName}
      photoURL={user.photoURL}
      uid={user.uid}
    />
    <button on:click={() => auth.signOut()}>Logout</button>
    <hr />
    <Todos uid={user.uid} />
  {:else}
    <button on:click={login}>Signin with Google</button>
  {/if}
</section>

<section>
  {#if user}
    <Tasks {user} />
  {/if}
</section>

<section>
  {#if user}
    <URL {user} />
  {/if}
</section>
