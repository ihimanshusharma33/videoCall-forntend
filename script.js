const hostForm=document.getElementById('hostForm');
const joinForm=document.getElementById('joinForm');
const joinRoomButton=document.getElementById('joinRoom');
const createRoomButton=document.getElementById('createRoom');
const joinRoomIdinput=document.getElementById('joinRoomId');
const hostRoomIdinput=document.getElementById('hostRoomId');
const hostUserName=document.getElementById('hostUserName');
const joinerUsername=document.getElementById('joinUserName');
const buttonLayout=document.getElementById('button-layout');
const closeBtn=document.getElementsByClassName('closeBtn');

Array.from(closeBtn).forEach((btn)=>{
    btn.onclick=()=>{
        console.log('Close button clicked');
        hostForm.style.display='none';
        joinForm.style.display='none';
        buttonLayout.style.display='flex';
        hostVideo.style.display='block';
        joinVideo.style.display='block';
    }
})
hostVideo.onclick=()=>{
    console.log('Host video clicked');
    buttonLayout.style.display='none';
    joinForm.style.display='none';
    hostForm.style.display='flex';
}

joinVideo.onclick=()=>{
    console.log('Join video clicked');
    hostVideo.style.display='none';
    joinVideo.style.display='none';
    joinForm.style.display='flex';
}

joinRoomButton.onclick=(e)=>{
    window.location.href=`../video.html`;
    sessionStorage.setItem('roomID',joinRoomIdinput.value);
    sessionStorage.setItem('role','join');
    sessionStorage.setItem('userName',joinerUsername.value);
    joinRoomIdinput.value='';
    joinerUsername.value='';
    console.log('Join room button clicked');
}

createRoomButton.onclick=(e)=>{
    e.preventDefault();
    window.location.href=`../video.html`
    sessionStorage.setItem('roomID',hostRoomIdinput.value);
    sessionStorage.setItem('role','host');
    sessionStorage.setItem('userName',hostUserName.value);
    hostRoomIdinput.value='';
    hostUserName.value='';
    console.log('Create room button clicked');
}