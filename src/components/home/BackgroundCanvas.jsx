"use client";

import { useEffect } from 'react';

export default function BackgroundCanvas() {
    useEffect(() => {
        const container = document.getElementById('randomBg');
        if (!container) return;

        // Clear existing if any (useful for strict mode/hot reload)
        container.innerHTML = '';

        const iconPool = [
            'fab fa-instagram', 'fab fa-twitter', 'fab fa-linkedin', 'fab fa-tiktok',
            'fab fa-youtube', 'fab fa-threads', 'fab fa-pinterest', 'fab fa-facebook',
            'fab fa-snapchat', 'fab fa-discord', 'fab fa-telegram', 'fab fa-whatsapp',
            'fab fa-reddit-alien', 'fab fa-x-twitter', 'fab fa-quora', 'fab fa-tumblr',
            'fab fa-flickr', 'fab fa-soundcloud', 'fab fa-spotify', 'fab fa-behance',
            'fab fa-dribbble', 'fab fa-medium', 'fas fa-hashtag', 'fas fa-at',
            'fas fa-globe', 'fas fa-share-nodes', 'fas fa-message', 'fas fa-camera',
            'fab fa-slack', 'fab fa-meta', 'fab fa-github', 'fab fa-weixin'
        ];

        for (let i = 0; i < 88; i++) {
            const wrap = document.createElement('div');
            wrap.className = 'social-float';
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = 1.5 + Math.random() * 2.8;
            const rotation = (Math.random() * 30 - 15).toFixed(1);
            const opacity = 0.10 + Math.random() * 0.10;
            const iconClass = iconPool[Math.floor(Math.random() * iconPool.length)];

            wrap.style.left = left + '%';
            wrap.style.top = top + '%';
            wrap.style.fontSize = size + 'rem';
            wrap.style.color = `rgba(110, 85, 145, ${opacity})`;
            wrap.style.transform = `rotate(${rotation}deg)`;
            wrap.style.animationDelay = (Math.random() * 20) + 's';

            const icon = document.createElement('i');
            iconClass.split(' ').forEach(cls => icon.classList.add(cls));
            icon.setAttribute('aria-hidden', 'true');
            wrap.appendChild(icon);
            container.appendChild(wrap);
        }
    }, []);

    return <div className="random-social-bg" id="randomBg" style={{ zIndex: 0, position: 'fixed', pointerEvents: 'none' }}></div>;
}
