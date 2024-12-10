import { useParams } from 'react-router-dom';
import NavBar from '../navigation/navBar';
import { useUser } from '../../context/userContext';
import { getFirestore, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { useState, useEffect, useCallback } from 'react';
export default function Chat() {
    const { friendId } = useParams(); 
    const {user} = useUser();
    const db = getFirestore(app);
    const[chatID,setChatID] = useState(null);
    const [userData,setUserData] = useState(null);//USER DATA HAS ALL THE USERS DATA 
    const [friendData,setFriendData] = useState(null);//FRIEND DATA HAS ALL THE FRIENDS DATA 
    const [messages,setMessages] = useState([]);
    const [message,setMessage] = useState("");
    useEffect(() => {
        const userDocRef = doc(db, 'users', user.uid);
        const friendDocRef = doc(db, 'users', friendId);
        
        getDoc(userDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });

        getDoc(friendDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                setFriendData(docSnap.data());
            }
        });
    }, [user.uid, friendId, db]);//rerun this when the user.uid or friendId changes


    const getChatID = useCallback(async () => {
        const chatDocId = [user.uid, friendId].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatDocId);

        try {
            const chatDocSnap = await getDoc(chatDocRef);
            if (chatDocSnap.exists()) {
                setChatID(chatDocId);
            } else {
                await setDoc(chatDocRef, {
                    users: [user.uid, friendId],
                    messages: []
                });
                setChatID(chatDocId);
            }
        } catch (error) {
            console.error("Error fetching or creating chat document:", error);
        }
    }, [user.uid, friendId, db]);

    useEffect(() => {
        const fetchChatID = async () => {
            await getChatID();
        };
        fetchChatID();
    }, [getChatID]);

    //okay so now we have the user data and the friend data


    useEffect(() => {
        if (!chatID) return;

        const chatDocRef = doc(db, 'chats', chatID);
        const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setMessages(docSnapshot.data().messages);
            }
        }, (error) => {
            console.error("Error listening to messages:", error);
        });

        return () => unsubscribe(); // Cleanup subscription
    }, [chatID, db]);


    const sendMessage = async (e) => {
        e.preventDefault(); // Prevent form submission
        if (!message.trim() || !chatID) return;

        try {
            const chatDocRef = doc(db, 'chats', chatID);
            const newMessage = {
                text: message.trim(),
                sender: user.uid,
                timestamp: new Date().toISOString()
            };
            
            await setDoc(chatDocRef, {
                users: [user.uid, friendId],
                messages: [...messages, newMessage]
            });
            
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
                {userData && <h2 style={{ color: "black" }}>Chat with {friendData?.username}</h2>}
            </div>
            
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                marginBottom: '20px'
            }}>
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        style={{
                            alignSelf: message.sender === user.uid ? 'flex-end' : 'flex-start',
                            backgroundColor: message.sender === user.uid ? '#007bff' : '#e9ecef',
                            color: message.sender === user.uid ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            maxWidth: '70%'
                        }}
                    >
                        <div>{message.text}</div>
                        <small style={{ fontSize: '0.8em' }}>
                            {message.sender === user.uid ? 'You' : friendData?.username}
                        </small>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} style={{ 
                display: 'flex', 
                gap: '10px',
                padding: '20px',
                borderTop: '1px solid #ddd'
            }}>
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                    placeholder="Type a message..."
                />
                <button 
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    </div>;
}