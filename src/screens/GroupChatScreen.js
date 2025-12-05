import React, { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';

const listMessagesQuery = `
  query ListMessages($filter: ModelMessageFilterInput) {
    listMessages(filter: $filter, limit: 500) {
      items {
        id
        content
        attachmentUrl
        fileName
        fileType
        groupID
        userID
        user {
          id
          full_name
          email
        }
        createdAt
      }
    }
  }
`;

const createMessageMutation = `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`;

function GroupChatScreen({ route }) {
  const groupId = route.params?.groupId;
  const groupTitle = route.params?.title || 'Group chat';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      setError('');
      const result = await client.graphql({
        query: listMessagesQuery,
        variables: { filter: { groupID: { eq: groupId } } },
      });
      let items = result?.data?.listMessages?.items || [];
      items = items
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMessages(items);
    } catch (e) {
      console.error('[GroupChat] Error fetching messages:', e);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        console.error('[GroupChat] Auth error:', e);
      } finally {
        await fetchMessages();
        // simple polling every 5 seconds
        interval = setInterval(fetchMessages, 5000);
      }
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
  };

  const sendMessage = async () => {
    if (!currentUser) {
      alert('You must be logged in to send messages.');
      return;
    }

    const trimmed = newMessage.trim();
    if (!trimmed && !file) return; // nothing to send

    try {
      setSending(true);
      setError('');

      let attachmentKey = null;
      let fileName = null;
      let fileType = null;

      if (file) {
        // relative key we store in DynamoDB
        const baseKey = `group-files/${groupId}/${Date.now()}-${file.name}`;

        // upload under protected/<identityId>/... so it matches Amplify S3 policy
        await uploadData({
          data: file,
          path: ({ identityId }) => `protected/${identityId}/${baseKey}`,
        }).result;

        attachmentKey = baseKey; // store only relative key
        fileName = file.name;
        fileType = file.type || 'application/octet-stream';
      }

      await client.graphql({
        query: createMessageMutation,
        variables: {
          input: {
            content: trimmed || (file ? '(file attached)' : ''),
            attachmentUrl: attachmentKey, // note: this is the base key
            fileName,
            fileType,
            groupID: groupId,
            userID: currentUser.userId,
          },
        },
      });

      setNewMessage('');
      setFile(null);
      await fetchMessages();
    } catch (e) {
      console.error('[GroupChat] Error sending message:', e);
      setError('Failed to send message.');
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOpenAttachment = async (message) => {
    if (!message.attachmentUrl) return;

    try {
      // message.attachmentUrl is the base key we stored (group-files/...)
      const baseKey = message.attachmentUrl;

      const result = await getUrl({
        path: ({ identityId }) => `protected/${identityId}/${baseKey}`,
        options: { expiresIn: 3600 }, // 1 hour
      });

      const url = result?.url?.toString();
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Could not get file URL.');
      }
    } catch (e) {
      console.error('[GroupChat] Error opening attachment:', e);
      alert('Could not open file. Please try again.');
    }
  };

  const renderMessage = (msg) => {
    const isMe = currentUser && msg.userID === currentUser.userId;
    const authorName = isMe
      ? 'You'
      : msg.user?.full_name || msg.user?.email || 'Member';

    const timeStr = msg.createdAt
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
          marginBottom: 8,
        }}
      >
        <div
          style={{
            maxWidth: '70%',
            background: isMe ? '#2563eb' : '#ffffff',
            color: isMe ? '#ffffff' : '#111827',
            borderRadius: 14,
            padding: '8px 10px',
            boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              opacity: 0.8,
              marginBottom: 2,
            }}
          >
            {authorName}
          </div>

          {msg.content && (
            <div
              style={{
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </div>
          )}

          {msg.fileName && (
            <button
              type="button"
              onClick={() => handleOpenAttachment(msg)}
              style={{
                marginTop: 6,
                borderRadius: 999,
                border: 'none',
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: isMe ? '#1d4ed8' : '#eff6ff',
                color: isMe ? '#e5e7eb' : '#1d4ed8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📎</span>
              <span
                style={{
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {msg.fileName}
              </span>
            </button>
          )}

          {timeStr && (
            <div
              style={{
                fontSize: '0.7rem',
                marginTop: 4,
                textAlign: 'right',
                opacity: 0.7,
              }}
            >
              {timeStr}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">{groupTitle}</div>
          <div className="page-subtitle">
            Group chat &amp; file sharing for this project.
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 12px',
            borderRadius: 12,
            background: '#f9fafb',
            marginBottom: 10,
          }}
        >
          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 18,
              }}
            >
              Loading messages…
            </p>
          ) : messages.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 18,
              }}
            >
              No messages yet. Say hi and share your first file!
            </p>
          ) : (
            messages.map((m) => renderMessage(m))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              color: 'var(--danger)',
              fontSize: '0.8rem',
              marginBottom: 6,
            }}
          >
            {error}
          </div>
        )}

        {/* File + input row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ fontSize: '0.8rem' }}
            />
            {file && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Selected: {file.name}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              className="input-field"
              placeholder="Type a message (Enter to send, Shift+Enter for new line)…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                resize: 'none',
                minHeight: 40,
                maxHeight: 100,
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChatScreen;
