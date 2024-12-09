const socket = io('https://video-demo-roan.vercel.app/'); // Update to your server's URL
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallButton = document.getElementById('endCall');
const muteAudioButton = document.getElementById('muteAudio');
const muteVideoButton = document.getElementById('muteVideo');
const offerAcceptButton = document.getElementById('confirmation-box');
const chats = document.getElementById('chats');
const chatButton = document.getElementById('chatButton');
const closeChat = document.getElementById('closeChat');
const openChat = document.getElementById('openChat');
const sendChat = document.getElementById('sendChat');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('message-content');
const endCall = document.getElementById('endCall');

const VideoMute = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video-off"><path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="m2 2 20 20"/></svg>';
const VideoUnmute = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>';
const messages = [];


function FormateMessage(Message) {
    return {
        'message': Message,
        'time': new Date().getTime(),
        'sender': userName
    }

}
function updateUI() {
    chatMessages.innerHTML = '';
    messages.forEach((message) => {
        const messageElement = document.createElement('li');
        messageElement.innerText = `${message.sender}: ${message.message}`;
        chatMessages.appendChild(messageElement);
    });
}
const UnmuteAudio = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
const muteAudio = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-off"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>'


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

let localStream;
let peerConnection;
let IsAudioMute = false;
let IsVideoMute = false;

const role = sessionStorage.getItem('role');
const roomID = sessionStorage.getItem('roomID');
const userName = sessionStorage.getItem('userName');



// Variables to track the mute state
let isAudioMuted = false;
let isVideoMuted = false;


// Start the local video stream
const startLocalVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true, // Reduces echo
                noiseSuppression: true, // Reduces background noise
                autoGainControl: true,
            }
            ,
            video: true,
        });
        console.log({ stream });
        localStream = stream;
        localVideo.srcObject = stream;
    } catch (error) {
        muteVideoButton.innerHTML = VideoMute
        muteAudioButton.innerHTML = muteAudio;
        throw error; // Reject if there's an error
    }
};

// // Create a peer connection
const PeerConnection = (() => {
    console.log('PeerConnection function called');

    let peerConnection; // Singleton instance

    const createPeerConnection = async () => {
        // Ensure localStream is initialized
        if (!localStream) {
            console.log('Waiting for local stream...');
            await startLocalVideo();
        }

        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                },
            ],
        };

        peerConnection = new RTCPeerConnection(config);

        // Add local stream tracks to the connection
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });

        // Listen for remote stream and set it to the video element
        peerConnection.ontrack = (event) => {
            console.log('Received remote stream:', event.streams[0]);
            remoteVideo.srcObject = event.streams[0];
        };

        // Listen for ICE candidates and send them to the server
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate: to server', event.candidate);
                socket.emit('icecandidate', { roomID, candidate: event.candidate });

            }
        };

        return peerConnection;
    };

    return {
        // Returns the existing instance or creates one if it doesn't exist
        getInstance: async () => {
            if (!peerConnection) {
                peerConnection = await createPeerConnection();
            }
            return peerConnection;
        },
    };
})();

startLocalVideo();

// Mute/Unmute Audio and Video
muteAudioButton.onclick = () => {
    if (!localStream) {
        muteAudioButton.innerHTML = muteAudio;
        return;
    }
    // Toggle the enabled state of the audio track
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = isAudioMuted;
        muteAudioButton.innerHTML = isAudioMuted ? UnmuteAudio : muteAudio;
        isAudioMuted = !isAudioMuted;
    }
}
muteVideoButton.onclick = () => {
    if (!localStream) {
        muteVideoButton.innerHTML = VideoMute;
        return;
    }
    // Toggle the enabled state of the video track
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        isVideoMuted = !isVideoMuted;
        videoTrack.enabled = !isVideoMuted;
        muteVideoButton.innerHTML = isVideoMuted ? VideoMute : VideoUnmute;
    }
}


// Fetch session data


// Redirect if required session data is missing
if (!role || !roomID || !userName) {
    alert('Session data missing. Redirecting to login.');
    window.location.href = '../index.html';
}

// Notify connection to server
socket.on('connect', () => {
    console.log('Connected to socket server with ID:', socket.id);
    // Create or join a room based on role
    if (role === 'host') {
        console.log('Host joining room:', roomID);
        socket.emit('createRoom', { roomID, userName });
        startCall();
    }
    else {
        console.log('Requesting host to join in the rooom', roomID, 'and user', userName);
        socket.emit('askToHost', { otherUser: userName, roomID, socketID: socket.id, role: role });
    }
});


//ask to host for joining the other non-host user
socket.on('askToHost', ({ otherUser, roomID, socketID }) => {
    if (!otherUser || !roomID) {
        console.log('Missing data for askToHost event');
    }
    if (role === "host") {
        console.log(`${otherUser} wants to join the room`);
        offerAcceptButton.innerHTML = `
        <h3>${otherUser} wants to join the room</h3>
        <button id="acceptOfferButton">Accept</button>
        <button id="rejectOfferButton">Reject</button>
    `;
        const acceptOfferButton = document.getElementById('acceptOfferButton');
        const rejectOfferButton = document.getElementById('rejectOfferButton');

        document.getElementById('acceptOfferButton').onclick = () => {
            socket.emit('joinRoom', { otherUser, roomID, socketID });
            offerAcceptButton.innerHTML = '';
        };
        document.getElementById('rejectOfferButton').onclick = () => {
            console.log(`Rejected ${otherUser}`);
            socket.emit('rejectOffer', { message: `host rejected the offer to join the room`, otherUser, roomID });
            //
            // here reject event emited
            //
            offerAcceptButton.innerHTML = '';
        };
    }
    console.log('askToHost event triggered');
})

// Handle errors from the server
socket.on('error', (error) => {
    alert(error.message);
    window.location.href = '../index.html';
});
socket.on('hostAcceptOffer', ({ message, otherUser, roomID }) => {
    console.log(role);
    if (role === 'join') {
        console.log('Host accepted the offer to join the room');
        startCall();
    }
});
socket.on('rejectOffer', ({ message, otherUser, roomID }) => {
    console.log('Host rejected the offer to join the room');
    alert('Host rejected the offer to join the room');
})

sendChat.onclick = () => {
    const FormatedMessage = FormateMessage(chatInput.value);
    socket.emit('privateMessage', { FormatedMessage, roomID: roomID, socketID: socket.id });
    chatInput.value = '';
}

socket.on('ReceiveMessage', ({ FormatedMessage, socketID, roomID }) => {
    messages.push(FormatedMessage);
    updateUI();
    console.log('Private message received:', FormatedMessage, 'in the room', roomID);
});

// Handle incoming WebRTC 'offer' event
socket.on('offer', async ({ from, offer }) => {
    try {
        const pc = await PeerConnection.getInstance();
        if (!pc) {
            throw new Error("PeerConnection instance is unavailable.");
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: from, answer: pc.localDescription });
    } catch (error) {
        console.log('[WebRTC] Error handling offer:', error);
    }
});

// Handle 'answer' event from the server
socket.on('answer', async ({ from, answer }) => {
    console.log(`Received answer from: ${from}`, answer);
    try {
        // Get the PeerConnection instance
        const pc = await PeerConnection.getInstance()
        // Set the received answer as the remote description
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote description set with the received answer.');
    } catch (error) {
        console.error('Error handling answer:', error);
    }
});

// Handle 'icecandidate' event from the server
socket.on('icecandidate', async (data) => {
    const candidate = data?.candidate || data;
    try {
        const pc = await PeerConnection.getInstance();
        // Add the ICE candidate to the peer connection
        if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE candidate added successfully.');
        } else {
            console.warn('Invalid candidate received:', candidate);
        }
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
});

// Initiate a call (triggered by user interaction or role)
const startCall = async () => {
    try {
        const pc = await PeerConnection.getInstance();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('Local description set with offer:', offer);
        socket.emit('offer', { roomID, offer });
        console.log('Offer sent to server.');
    }
    catch (error) {
        console.error('Error starting call:', error);
    }
};

endCall.onclick = () => {
    socket.emit('endCall');
    window.location.href = '../index.html';
}