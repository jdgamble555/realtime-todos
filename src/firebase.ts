import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions"; 
import * as config from "./config.json";

firebase.initializeApp(config);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const db = firebase.firestore();
export const functions = firebase.functions();

export const getToken = async (): Promise<any> => {
  const user = await getCurrentUser(auth);
  if (user) {
    const callable = functions.httpsCallable("addAdminRole");
    await callable({
      email: user?.email,
    });
    return await user.getIdToken(true);
  }
  return Promise.resolve();
};

/** 
 * Promise version of onAuthStateChanged
 * @param auth 
 * @returns - updated user
 */
function getCurrentUser(auth: firebase.auth.Auth): Promise<firebase.User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user: firebase.User) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}
