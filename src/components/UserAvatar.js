import React, { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';

const UserAvatar = ({ profilePicKey, name }) => {
    const [src, setSrc] = useState(null);

    useEffect(() => {
        if (!profilePicKey) return;

        getUrl({
            path: profilePicKey,
            options: { validateObjectExistence: true }
        })
            .then(res => setSrc(res.url.toString()))
            .catch(err => {
                console.log("Avatar load error:", err);
                setSrc(null);
            });
    }, [profilePicKey]);

    const initial = name ? name.charAt(0).toUpperCase() : '?';

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover'
                }}
            />
        );
    }

    return (
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
            }}
        >
            {initial}
        </div>
    );
};

export default UserAvatar;
