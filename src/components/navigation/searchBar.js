import {useUser} from '../../context/userContext';

import {collection,query,where,getDocs,getFirestore,doc,arrayUnion, updateDoc} from 'firebase/firestore';
import app from '../../firebaseConfig';
import {useState,useEffect} from 'react';

//TODO: Make the search bar in the nav 
const SearchBar = () => {
  const {user} = useUser();//this is used to access the user data from the user context
  const [searchInput, setSearchInput] = useState('');//this is the input that will be used to search for users
  const [results, setResults] = useState([]); //this is the array that will store the results of the search
  const db = getFirestore(app);

  useEffect(() => {//useEffect is used to fetch the users from the database when the search input changes 
    const fetchUsers = async () => {//async because fetching data from the database is an asynchronous operation
      if (searchInput.length > 0) {//if the search input is not empty
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', searchInput));
        const querySnapshot = await getDocs(q);
        setResults(querySnapshot.docs.map((doc) => doc.data()));//this is used to set the results to the users fetched from the database
      }
    };
    fetchUsers();
  }, [searchInput,db]);

  const handleChange = (e) => {
    setSearchInput(e.target.value);//this is used to set the search input to the value of the input field
  };

  const addFriend = async (uid) => {
    //this will add friend
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      friends:arrayUnion(user.uid)
    });
    console.log(uid);
  };

  return (
    <div>
      <input type="text" value={searchInput} onChange={handleChange} placeholder="Search users..." />
      <ul>
        {results.map((result, index) => (//for each user in the results array, a list item is created
          <li key={index}>
            {result.username}
            <button onClick={() => addFriend(result.uid)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;