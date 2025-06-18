import { useParams } from 'react-router-dom';
import NavBar from '../navigation/navBar';
import { useUser } from '../../context/userContext';
import { getFirestore, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/chatroom.css';

export default function Chat() {
    const { friendId } = useParams(); 
    const {user} = useUser();
    const db = getFirestore(app);
    const[chatID,setChatID] = useState(null);
    const [userData,setUserData] = useState(null);//USER DATA HAS ALL THE USERS DATA 
    const [friendData,setFriendData] = useState(null);//FRIEND DATA HAS ALL THE FRIENDS DATA 
    const [messages,setMessages] = useState([]);
    const [message,setMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

    return (
      <div className="chat-bg">
        <NavBar />
        <div className="chat-card">
          <div className="chat-header">
            {userData && <span>Chat with {friendData?.username}</span>}
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-bubble ${message.sender === user.uid ? 'me' : 'friend'}`}
              >
                <div>{message.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="chat-input-row">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="chat-input"
              placeholder="Type your message..."
            />
            <button type="submit" className="chat-send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    );
}