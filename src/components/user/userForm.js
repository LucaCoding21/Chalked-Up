import React, {useState} from 'react';
import {useUser} from '../../context/userContext';
import app from '../../firebaseConfig';
import {getFirestore,collection, doc,getDoc,setDoc,query,where,getDocs} from 'firebase/firestore';
import '../../styles/userForm.css';


export default function UserForm(){
  const {user} = useUser();
  const [userExists,setUserExists] = useState(null);
  const db = getFirestore(app);
  const userDocRef= doc(collection(db,'users'),user.uid);
  const [errorMessage,setErrorMessage] = useState('');
  //error message is the message that will be displayed if the username is not available
  //chatgpts recommended this
  //first parameter of doc is the collection reference, like what collection we are refering to
  //the second parameter is the ID of the document you want reference to
  //the collection users, the user.uid is the id of the user

  
  getDoc(userDocRef).then((docSnap) => {
    if(docSnap.exists()){

      setUserExists(true);
    }
    else{
      console.log("No such document!");
    }
  
  });
  async function isUsernameTaken(username) {
    const usersCollectionRef = collection(db, 'users');//go to the collection users
    const q = query(usersCollectionRef, where('username', '==', username));//query the collection users where the username is equal to the username we are checking
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if the username is taken
  }
  
  async function handleSubmit(event) {
    event.preventDefault();
    const data = event.target;
    const name = data.name.value;
    const bio = data.bio.value;
    const phoneNumber = data.phoneNumber.value;
    const username = data.username.value;

    const usernameTaken = await isUsernameTaken(username);
    if (usernameTaken) {
      setErrorMessage('Username is not available. Please choose another one.');
      return; // Stop the form submission if the username is not available
    }

    await setDoc(userDocRef, {
      uid: user.uid,
      name: name,
      phoneNumber: phoneNumber,
      bio: bio,
      username: username,
    });

    setUserExists(true);
    setErrorMessage('');
  }
    //if user exists, show the user form
    //if user does not exist, show the user does not exist message
    return <div>
       {!userExists ?(
         <div className='userForm'>
         {errorMessage && <div className='errorMessage'>{errorMessage}</div>}
         <form onSubmit={handleSubmit}>
           <input type="text"name="name" placeholder="Name" />
           <input type="text"name="username" placeholder="Username" />
           <input type="text"name="phoneNumber" placeholder="Phone Number" />
           <input type="text"name="bio" placeholder='Bio' />
           
           <button type="submit">Create User</button>
  
         </form>
        
         </div>
         ) : ( 
          <></>
         )}
    </div>
}