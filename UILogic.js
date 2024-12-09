const VideoMute = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-off"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/></svg>';
const VideoUnmute = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>';
const UnmuteAudio = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
const muteAudio = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>'
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallButton = document.getElementById('endCall');
const muteAudioButton = document.getElementById('muteAudio');
const muteVideoButton = document.getElementById('muteVideo');
const offerAcceptButton = document.getElementById('confirmation-box');
const chats = document.getElementById('chats');
const chatButton = document.getElementById('chatButton');
const closeChat = document.getElementById('closeChat');
const openChat= document.getElementById('openChat');

let isAudioMuted = false;
let isVideoMuted = false;

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

chatButton.onclick = () => {
    console.log('Chat open button clicked')
    chats.style.display = 'block';
    chatButton.style.display = 'none';
    remoteVideo.style.width = '65vw';
}

closeChat.onclick = () => {
    console.log('Close chat button clicked')
    chats.style.display = 'none';
    chatButton.style.display = 'block';
    remoteVideo.style.width = '75vw';
}
openChat.onclick = () => {
    console.log('Open chat button clicked')
    chats.style.display = 'block';
    chatButton.style.display = 'none';
    remoteVideo.style.width = '65vw';
}


// Mouse down event
localVideo.addEventListener('mousedown', (e) => {
    isDragging = true;
    // Calculate offset between mouse pointer and the top-left corner of the div
    offsetX = e.clientX - localVideo.offsetLeft;
    offsetY = e.clientY - localVideo.offsetTop;
});

// Mouse move event
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const newX = event.clientX - offsetX;
    const newY = event.clientY - offsetY;

    // Calculate the boundaries
    const maxX = window.innerWidth - localVideo.offsetWidth - 10;
    const maxY = window.innerHeight - localVideo.offsetHeight - 10;

    // Set the new position, ensuring it stays within boundaries
    localVideo.style.left = `${Math.min(Math.max(newX, 0), maxX)}px`;
    localVideo.style.top = `${Math.min(Math.max(newY, 0), maxY)}px`;
});

// Mouse up event
document.addEventListener('mouseup', () => {
    isDragging = false; // Stop dragging
});
