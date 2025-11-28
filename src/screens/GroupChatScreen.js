import React, { useState, useEffect, useRef } from 'react';

function GroupChatScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    // 1. Load user from local storage (Enterprise Auth)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }, []);

    // 2. Fetch Messages from Node.js API (PostgreSQL)
    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Call the GET endpoint you defined in chatRoutes.js
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/chat/${groupId}`, {
                headers: { 'x-auth-token': token }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (e) {
            console.error("Chat Error:", e);
        } finally {
            setLoading(false);
        }
    };

    // 3. Send Message via Node.js API
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            // Call the POST endpoint you defined in chatRoutes.js
            await fetch(`https://tfg-backend-x926.onrender.com/api/chat/${groupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ content: newMessage })
            });
            
            setNewMessage('');
            fetchMessages(); // Refresh immediately to show the new message
        } catch (e) {
            alert("Failed to send message");
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Initial Load & Polling (Fetch every 3 seconds)
    useEffect(() => {
        if (groupId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [groupId]);

    useEffect(scrollToBottom, [messages]);

    if (!groupId) return <p style={{textAlign: 'center', marginTop: '20px'}}>Error: No Group ID provided.</p>;

    return (
        <div className="form-container" style={{maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column'}}>
            <div style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center'}}>
                {/* BACK BUTTON: Set to Dashboard to ensure no loop */}
                <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginRight: '10px', padding: '5px 10px'}}>
                    &larr; Back to Dashboard
                </button>
                <h3>Group Chat</h3>
            </div>

            <div style={{flexGrow: 1, overflowY: 'auto', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px'}}>
                {loading && <p>Loading chat...</p>}
                {messages.length === 0 && !loading && <p style={{textAlign: 'center', color: '#888'}}>No messages yet.</p>}
                
                {messages.map((msg) => (
                    <div key={msg.message_id} style={{
                        textAlign: msg.sender_id === currentUser?.id ? 'right' : 'left',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            background: msg.sender_id === currentUser?.id ? 'var(--color-primary)' : '#e9e9e9',
                            color: msg.sender_id === currentUser?.id ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            maxWidth: '70%'
                        }}>
                            <small style={{display: 'block', fontSize: '0.7em', marginBottom: '2px', opacity: 0.8}}>
                                {msg.sender_id === currentUser?.id ? 'You' : msg.full_name}
                            </small>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{display: 'flex'}}>
                <input 
                    type="text" 
                    className="input-field" 
                    style={{margin: 0, borderRadius: '4px 0 0 4px', flex: 1}} // Added flex: 1 to ensure it's clickable
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                    onClick={sendMessage} 
                    className="btn btn-primary" 
                    style={{borderRadius: '0 4px 4px 0'}}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default GroupChatScreen;