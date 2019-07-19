import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyAGsoh0gpjHV4JUoPrjs6GStdQJb578K9M',
  authDomain: 'chesswars-4bbea.firebaseapp.com',
  databaseURL: 'https://chesswars-4bbea.firebaseio.com',
  projectId: 'chesswars-4bbea',
  storageBucket: '',
  messagingSenderId: '869039004935',
  appId: '1:869039004935:web:fcc05f1f6cb6ef55',
};

class Database {
  app: firebase.app.App;
  constructor() {
    this.app = firebase.initializeApp(firebaseConfig);

    const provider = new firebase.auth.GoogleAuthProvider();
    this.app.auth().onAuthStateChanged(user => {
      if (!user) {
        firebase.auth().signInWithRedirect(provider);
      }
    });
  }

  saveAi(ai: string) {
    const user = this.app.auth().currentUser;
    if (user) {
      this.app
        .database()
        .ref('codes/' + user.uid)
        .set(ai);
    }
  }

  watchAis(cb: (val: { [key: string]: string }) => void) {
    const codesRef = this.app.database().ref('codes');
    codesRef.on('value', snapshot => {
      cb(snapshot.val());
    });
  }
}
const db = new Database();
export { db };
