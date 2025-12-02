import React, { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';

const UserAvatar = ({ profilePicKey, name }) => {
    const [src, setSrc] = useState(null);

    if (profilePicKey) {
        getUrl({ 
            key: profilePicKey,
            options: { accessLevel: 'protected' } // <--- ADD THIS LINE
        }).then(res => setSrc(res.url.toString()));
    }

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