import React, { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';

const UserAvatar = ({ profilePicKey, name }) => {
    // Note: profilePicKey now contains the full path (e.g., "public/avatars/...")
    const [src, setSrc] = useState(null);

    useEffect(() => {
        if (profilePicKey) {
            getUrl({ 
                path: profilePicKey, // <--- FIX: Use 'path' instead of 'key'
                options: {
                    validateObjectExistence: true
                }
            })
            .then(res => setSrc(res.url.toString()))
            .catch(e => console.log("Error loading avatar:", e));
        }
    }, [profilePicKey]);

    const initial = name ? name.charAt(0).toUpperCase() : '?';

    if (src) {
        return <img src={src} alt={name} style={{width: 40, height: 40, borderRadius: '50%', objectFit: 'cover'}} />;
    }

    return (
        <div style={{
            width: 40, height: 40, borderRadius: '50%', 
            backgroundColor: '#ccc', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>
            {initial}
        </div>
    );
};

export default UserAvatar;