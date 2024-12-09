
const socket = io('http://localhost:3000/');
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
    console.log('askToHost event triggered');
    if (!otherUser || !roomID) {
        console.log('Missing data for askToHost event');
    }
    console.log(`${otherUser} wants to join the room`);
    if (role === "host") {
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
    console.log('host accepted the offer to join the room');
    console.log(message)
    console.log(roomID);
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

// Handle incoming WebRTC 'offer' event
socket.on('offer', async ({ from, offer }) => {
    console.log(`[WebRTC] Received offer from ${from}.`);
    try {
        const pc = await PeerConnection.getInstance();
        if (!pc) {
            throw new Error("PeerConnection instance is unavailable.");
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('[WebRTC] Remote description set.');

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('[WebRTC] Local description set with answer.');

        socket.emit('answer', { to: from, answer: pc.localDescription });
        console.log(`[WebRTC] Answer sent to ${from}.`);
    } catch (error) {
        console.log('[WebRTC] Error handling offer:', error);
        alert('Failed to handle incoming call.');
    }
});

// Handle 'answer' event from the server
socket.on('answer', async ({ from, answer }) => {
    console.log(`Received answer from: ${from}`, answer);

    try {
        // Get the PeerConnection instance
        const pc = await PeerConnection.getInstance();

        // Set the received answer as the remote description
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote description set with the received answer.');
    } catch (error) {
        console.error('Error handling answer:', error);
    }
});

// Handle 'icecandidate' event from the server
socket.on('icecandidate', async (data) => {
    // Validate and normalize the candidate format
    const candidate = data?.candidate || data;

    console.log('Received ICE candidate:', candidate);

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
