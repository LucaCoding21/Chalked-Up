import { useParams } from 'react-router-dom';
import NavBar from '../navigation/navBar';
import { useUser } from '../../context/userContext';
import { getFirestore, getDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../styles/chatroom.css';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
    const { friendId } = useParams(); 
    const {user} = useUser();
    const db = getFirestore(app);
    const navigate = useNavigate();
    const[chatID,setChatID] = useState(null);
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
        const friendDocRef = doc(db, 'users', friendId);
        
        getDoc(friendDocRef).then((docSnap) => {
            if (docSnap.exists()) {
                setFriendData(docSnap.data());
            }
        });
    }, [friendId, db]);//rerun this when the friendId changes

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

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleBackClick = () => {
        navigate('/chatroom');
    };

    return (
      <div className="chat-bg">
        <NavBar />
        <div className="chat-card">
          <div className="chat-header">
            <button 
              onClick={handleBackClick}
              style={{
                background: 'rgba(229, 209, 122, 0.1)',
                border: '1px solid rgba(229, 209, 122, 0.2)',
                color: '#e5d17a',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                minWidth: '44px',
                minHeight: '44px',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(229, 209, 122, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(229, 209, 122, 0.1)'}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <span>{friendData?.username || 'Loading...'}</span>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#a0aec0',
                padding: '2rem',
                fontSize: '0.9rem'
              }}>
                Start a conversation with {friendData?.username || 'your friend'}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${message.sender === user.uid ? 'me' : 'friend'}`}
                >
                  <div>{message.text}</div>
                  <div className="chat-bubble-meta">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="chat-input-row">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="chat-input"
              placeholder="Type a message..."
            />
            <button type="submit" className="chat-send-btn">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      </div>
    );
}