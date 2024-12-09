import {useUser} from '../../context/userContext';
import NavBar from '../navigation/navBar';
import {collection,getFirestore,query,where,getDocs,orderBy} from 'firebase/firestore';
import app from '../../firebaseConfig';
import React, {useState,useEffect} from 'react';
import Login from '../login';

//TODO: make the my profile page
//TODO: make the my profile page look nice
export default function MyProfile() {
    const {user} = useUser();
    const db = getFirestore(app);
    const [userData,setUserData] = useState([]);
    useEffect(() => {
        const postDocRef = query(
            collection(db, 'posts'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc') // This combination requires a composite index
        );
        getDocs(postDocRef).then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUserData(userData);
            } else {
                console.log("No posts found for this user!");
            }
        });
    }, [db, user.uid]);
    
    if(!user){
        return <Login/>;
      }
    
    return <div>
        <NavBar/>
        {userData.map((post) => (//map the userData to an array of p tags
            <p>{post.post}</p>
        ))}
        </div>;
}