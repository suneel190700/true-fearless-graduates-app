// src/screens/GroupChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

/* ================================
   QUERIES & MUTATIONS
================================ */

// Fetch all messages filtered by groupID
const listMessagesQuery = `
  query ListMessages($filter: ModelMessageFilterInput) {
    listMessages(filter: $filter) {
      items {
        id
        content
        userID
        createdAt
        user {
          full_name
          email
        }
      }
    }
  }
`;

// Create a new message
const createMessageMutation = `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      userID
      createdAt
      user {
        full_name
        email
      }
    }
  }
`;

function GroupChatScreen({ navigateTo, route }) {
  const groupId = route?.params?.groupId;
  const groupTitle = route?.params?.title || 'Group Chat';

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [messages]);

  // Load current user + messages on mount
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        console.log('[GroupChat] currentUser:', user);
        setCurrentUser(user);

        await fetchMessages();
      } catch (e) {
        console.error('[GroupChat] Auth error:', e);
        setError('You must be logged in to use chat.');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchMessages = async () => {
    if (!groupId) return;

    try {
      const result = await client.graphql({
        query: listMessagesQuery,
        variables: {
          filter: {
            groupID: { eq: groupId },
          },
        },
      });

      const items = result?.data?.listMessages?.items || [];
      // Sort by createdAt ascending
      items.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });

      console.log('[GroupChat] fetched messages:', items);
      setMessages(items);
    } catch (e) {
      console.error('[GroupChat] Error loading messages:', e);
      setError('Failed to load messages.');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser?.userId || !groupId) return;

    setSending(true);
    setError('');

    try {
      const content = newMessage.trim();

      const result = await client.graphql({
        query: createMessageMutation,
        variables: {
          input: {
            content,
            groupID: groupId,
            userID: currentUser.userId,
          },
        },
      });

      const created = result?.data?.createMessage;
      console.log('[GroupChat] created message:', created);

      // Optimistically append the new message
      setMessages((prev) => {
        const next = [...prev, created].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });
        return next;
      });

      setNewMessage('');
    } catch (e) {
      console.error('[GroupChat] Error sending message:', e);
      setError(e?.errors?.[0]?.message || e.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Chat · {groupTitle}</div>
          <div className="page-subtitle">
            Real-time conversation space for this group.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('GroupDetails', { groupId })}
          >
            ← Back to Group
          </button>
        </div>
      </div>

      {/* Chat card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '68vh' }}>
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 4,
            paddingBottom: 8,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: '20px',
              }}
            >
              Loading messages…
            </p>
          ) : messages.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: '20px',
              }}
            >
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userID === currentUser?.userId;
              const senderName =
                msg.user?.full_name ||
                msg.user?.email ||
                (isMe ? 'You' : 'Member');
              const timestamp = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '6px 10px',
                      borderRadius: 12,
                      background: isMe ? 'var(--primary)' : '#f3f4f6',
                      color: isMe ? '#ffffff' : '#111827',
                      boxShadow: '0 6px 18px rgba(15,23,42,0.12)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.9,
                        }}
                      >
                        {senderName}
                      </span>
                      {timestamp && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            opacity: 0.7,
                          }}
                        >
                          {timestamp}
                        </span>
                      )}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              color: 'var(--danger)',
              fontSize: '0.8rem',
              marginTop: 6,
              marginBottom: 4,
            }}
          >
            {error}
          </p>
        )}

        {/* Input area */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            alignItems: 'flex-end',
          }}
        >
          <textarea
            className="input-field"
            style={{
              marginBottom: 0,
              minHeight: 40,
              maxHeight: 80,
              resize: 'none',
              flex: 1,
            }}
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupChatScreen;
