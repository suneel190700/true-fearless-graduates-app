import React, { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const listMessagesQuery = `
  query ListMessages($filter: ModelMessageFilterInput) {
    listMessages(filter: $filter) {
      items {
        id
        content
        userID
        user { full_name }
        createdAt
      }
    }
  }
`;

const createMessageMutation = `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) { id }
  }
`;

function GroupChatScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const client = generateClient();

    useEffect(() => {
        let interval;
    
        const init = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
    
            await fetchMessages();
    
            interval = setInterval(() => {
                fetchMessages();
            }, 3000);
        };
    
        init();
    
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [groupId]);
    

    const fetchMessages = async () => {
        try {
            const result = await client.graphql({
                query: listMessagesQuery,
                variables: {
                    filter: { groupID: { eq: groupId } }
                }
            });
            // Sort by time
            const sorted = result.data.listMessages.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sorted);
        } catch (e) { console.error(e); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            await client.graphql({
                query: createMessageMutation,
                variables: {
                    input: {
                        content: newMessage,
                        groupID: groupId,
                        userID: currentUser.userId
                    }
                }
            });
            setNewMessage('');
            fetchMessages();
        } catch (e) { alert("Failed to send"); }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    return (
        <div className="form-container" style={{maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column'}}>
            <div style={{borderBottom: '1px solid #eee', marginBottom: '10px', display:'flex', alignItems:'center'}}>
                <button onClick={() => navigateTo('GroupDetails', { groupId })} className="btn" style={{marginRight:'10px'}}>&larr; Back</button>
                <h3>Group Chat</h3>
            </div>

            <div style={{flexGrow: 1, overflowY: 'auto', padding: '10px', border: '1px solid #eee', marginBottom: '10px'}}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{textAlign: msg.userID === currentUser?.userId ? 'right' : 'left', marginBottom: '10px'}}>
                        <div style={{
                            display: 'inline-block',
                            background: msg.userID === currentUser?.userId ? 'var(--color-primary)' : '#e9e9e9',
                            color: msg.userID === currentUser?.userId ? 'white' : 'black',
                            padding: '8px 12px', borderRadius: '12px'
                        }}>
                            <small style={{display:'block', fontSize:'0.7em', opacity:0.8}}>
                                {msg.user ? msg.user.full_name : 'User'}
                            </small>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{display: 'flex'}}>
                <input type="text" className="input-field" style={{margin: 0, flex: 1}} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} className="btn btn-primary">Send</button>
            </div>
        </div>
    );
}

export default GroupChatScreen;