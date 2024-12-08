//THIS IS A CHEATSHEET FOR THE FIREBASE FIRESTORE DATABASE

//FIRESTORE DATABASE CHEATSHEET
//collection is a collection of documents
//document is a collection of data
//field is a key value pair in a document
//query is a query to get data from the database

//to get data from the database, we use the getDocs function
//to add data to the database, we use the addDoc function
//to update data in the database, we use the updateDoc function
//to delete data from the database, we use the deleteDoc function (not used in this project)

//example 
const userDocRef = doc(collection(db,'users'),user.uid);
    getDoc(userDocRef).then((docSnap) => {
        if(docSnap.exists()){
            const userData = docSnap.data();
            console.log(userData);
            setFriends(userData.friends || []);
        }
        else{
            console.log("No such document!");
        }
    });
    //so doc(collection(db,'users'),user.uid) is a reference to the document in the collection users where the uid is equal to the uid of the user
    //this returns a promise, so we use the then function to get the data
    //if the document exists, we get the data and set the friends state variable to the friends of the user
    //if the document does not exist, we log "No such document!"

