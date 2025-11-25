// src/screens/GroupChatScreen.js
import React, { useState, useEffect } from 'react';
import { rtdb, auth } from '../firebaseConfig'; // Import Realtime DB and Auth
import { ref, push, onValue, off, serverTimestamp } from "firebase/database";

function GroupChatScreen({ navigateTo, route }) {
    // The groupId is used as the chat room identifier in RTDB
    const groupId = route.params?.groupId;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const user = auth.currentUser;
    const senderId = user?.uid;

    useEffect(() => {
        if (!groupId) return;

        // 1. Define the reference path for this specific chat room
        const chatRef = ref(rtdb, `chats/${groupId}`);

        // 2. Set up the Real-Time Listener (onValue)
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = [];
            if (data) {
                // RTDB returns an object of messages, so we convert it to an array
                for (let key in data) {
                    loadedMessages.push({ id: key, ...data[key] });
                }
            }
            // Sort by timestamp (messages without serverTimestamp are pushed to the start/end)
            loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(loadedMessages);
        });

        // 3. Clean up the listener when the component unmounts
        return () => off(chatRef, 'value', unsubscribe);
    }, [groupId]);


    const sendMessage = async () => {
        if (newMessage.trim() === '' || !senderId) return;

        try {
            const chatRef = ref(rtdb, `chats/${groupId}`);
            
            // 4. Push new message data to the chat room
            await push(chatRef, {
                senderId: senderId,
                text: newMessage,
                timestamp: serverTimestamp() // RTDB helper for server time
            });

            setNewMessage(''); // Clear the input field

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!groupId) return <p style={{ textAlign: 'center' }}>Error: Chat ID is missing.</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <button onClick={() => navigateTo('GroupDetails', { groupId })} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                &larr; Back to Details
            </button>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Group Chat: {groupId.substring(0, 8)}...</h3>

            {/* Message Display Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                {messages.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Start the conversation!</p>}
                {messages.map((msg, index) => (
                    <div key={index} style={{ 
                        textAlign: msg.senderId === senderId ? 'right' : 'left', 
                        marginBottom: '8px' 
                    }}>
                        <div style={{ 
                            background: msg.senderId === senderId ? '#dcf8c6' : '#fff', 
                            padding: '8px', 
                            borderRadius: '10px', 
                            display: 'inline-block',
                            maxWidth: '80%'
                        }}>
                            <strong style={{ fontSize: '0.8em', color: '#666' }}>
                                {/* Display 'You' for the current user, or the start of the sender's ID */}
                                {msg.senderId === senderId ? 'You' : msg.senderId?.substring(0, 5)}:
                            </strong>
                            <p style={{ margin: 0 }}>{msg.text}</p>
                            {/* Note: Timestamp rendering is complex; this focuses on MVP functionality */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex' }}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }}
                    disabled={!senderId}
                />
                <button 
                    onClick={sendMessage} 
                    style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
                    disabled={!senderId || newMessage.trim() === ''}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default GroupChatScreen;