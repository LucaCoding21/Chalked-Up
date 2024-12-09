//THIS IS A CHEATSHEET FOR THE FIREBASE FIRESTORE DATABASE

//How to get the own user, users data
const userDocRef = doc(collection(db, 'users'), user.uid);
//what is doc? doc takes two arugments, the first argument is the reference to the collection and the second argument is the id of the document
getDoc(userDocRef).then((docSnap) => {//getDoc is a function that will get the info from that database and the docSnap is the data that is returned from the database
    if (docSnap.exists()) {
      const userData = docSnap.data();

    } else {
      console.log("No such document!");
    }
  });



//Question: There is a collection called X and we want to get the info from the document with the id of Y

const docRef1=doc(collection(db, 'X'), 'Y');
getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
    } else {
      console.log("No such document!");
    }
  });

//NOW we know how to grab data from specfic documents

//How to get all things that contain a specific field
//we will use a query
//Queries are used to get data from the database

const queryRef = query(collection(db, 'X'), where('field', '==', 'value'));
getDocs(queryRef).then((querySnapshot) => {
    const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
});
//querysnapshot returns an array of documents


//How to add a new document to a collection?
const docRef2 = doc(collection(db, 'X'));
await setDoc(docRef, {
    field: 'value'
});

//How to add a new field to a document
const docRef3 = doc(collection(db, 'X'), 'Y');
await updateDoc(docRef3, {
    field: 'value'
});


//How to update a document
const docRef4 = doc(collection(db, 'X'), 'Y');
await updateDoc(docRef4, {
    field: 'value'
});

//so if we want to repost a post, we can 
//make a post underuser, and in the spots we just put the posts.

