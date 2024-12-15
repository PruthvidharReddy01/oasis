import Peer from 'peerjs'
import Network from '../services/Network'
import store from '../stores'
import { IconButton } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import { setVideoConnected } from '../stores/UserStore'

export default class WebRTC {
  private myPeer: Peer
  private peers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private onCalledPeers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private videoGrid = document.querySelector('.video-grid')
  private buttonGrid = document.querySelector('.button-grid')
  private myVideo = document.createElement('video')
  private myStream?: MediaStream
  private network: Network

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId)
    this.myPeer = new Peer(sanitizedId)
    this.network = network
    console.log('userId:', userId)
    console.log('sanitizedId:', sanitizedId)
    this.myPeer.on('error', (err) => {
      console.log(err.type)
      console.error(err)
    })

    // mute your own video stream (you don't want to hear yourself)
    this.myVideo.muted = true

    // config peerJS
    this.initialize()
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G')
  }

  initialize() {
    this.myPeer.on('call', (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream)
        const video = document.createElement('video')
        this.onCalledPeers.set(call.peer, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })
      }
      // on close is triggered manually with deleteOnCalledVideoStream()
    })
  }

  // check if permission has been granted before
  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false)
    })
  }

  getUserMedia(alertOnError = true) {
    // ask the browser to get user media
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream
        this.addVideoStream(this.myVideo, this.myStream)
        this.setUpButtons()
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected()
      })
      .catch((error) => {
        if (alertOnError) window.alert('No webcam or microphone found, or permission is blocked')
      })
  }

  // method to call a peer
  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId)
      if (!this.peers.has(sanitizedId)) {
        console.log('calling', sanitizedId)
        const call = this.myPeer.call(sanitizedId, this.myStream)
        const video = document.createElement('video')
        this.peers.set(sanitizedId, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })

        // on close is triggered manually with deleteVideoStream()
      }
    }
  }

  // method to add new video stream to videoGrid div
  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream
    video.playsInline = true
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    if (this.videoGrid) this.videoGrid.append(video)
  }

  // method to remove video stream (when we are the host of the call)
  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId)
      peer?.call.close()
      peer?.video.remove()
      this.peers.delete(sanitizedId)
    }
  }

  // method to remove video stream (when we are the guest of the call)
  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId)
      onCalledPeer?.call.close()
      onCalledPeer?.video.remove()
      this.onCalledPeers.delete(sanitizedId)
    }
  }

  // method to set up mute/unmute and video on/off buttons
  setUpButtons() {
    // Create a container for both buttons
const buttonsContainer = document.createElement('div');
buttonsContainer.style.position = 'fixed'; // Fixed positioning
buttonsContainer.style.bottom = '20px'; // Distance from the bottom
buttonsContainer.style.left = '50%'; // Center horizontally
buttonsContainer.style.transform = 'translateX(-50%)'; // Offset to center the container
buttonsContainer.style.display = 'flex'; // Flex to align buttons horizontally
buttonsContainer.style.gap = '20px'; // Space between the buttons
buttonsContainer.style.zIndex = '999'; // Ensure buttons stay on top of other elements

// Create audio button
const audioButton = document.createElement('button');

// Set the icon for the button
const audioIcon = document.createElement('i');
audioIcon.className = 'fas fa-microphone'; // Default icon for microphone
audioButton.appendChild(audioIcon);

// Apply styles to the audio button
audioButton.style.background = 'linear-gradient(180deg, #8c51fe, rgb(83, 35, 179))'; // Purple background
audioButton.style.border = '2px solid white'; // No border
audioButton.style.borderRadius = '50%'; // Circular shape
audioButton.style.padding = '9px'; // Padding for spacing
audioButton.style.cursor = 'pointer'; // Pointer cursor for click action
audioButton.style.display = 'flex'; // Flex to center the icon
audioButton.style.alignItems = 'center'; // Center the icon vertically
audioButton.style.justifyContent = 'center'; // Center the icon horizontally
audioButton.style.width = '40px'; // Width of the button
audioButton.style.height = '40px'; // Height of the button
audioButton.style.color = 'white';

// Event listener for mute/unmute
audioButton.addEventListener('click', () => {
  if (this.myStream) {
    const audioTrack = this.myStream.getAudioTracks()[0];
    if (audioTrack.enabled) {
      audioTrack.enabled = false;
      audioIcon.className = 'fas fa-microphone-slash'; // Change to muted icon
    } else {
      audioTrack.enabled = true;
      audioIcon.className = 'fas fa-microphone'; // Change to unmuted icon
    }
  }
});

// Create video button
const videoButton = document.createElement('button');

// Set the icon for the button
const videoIcon = document.createElement('i');
videoIcon.className = 'fas fa-video'; // Default icon for video
videoButton.appendChild(videoIcon);

// Apply styles to the video button
videoButton.style.background = 'linear-gradient(180deg, #8c51fe, rgb(83, 35, 179))'; // Purple background
videoButton.style.border = '2px solid white'; // No border
videoButton.style.borderRadius = '50%'; // Circular shape
videoButton.style.padding = '9px'; // Padding for spacing
videoButton.style.cursor = 'pointer'; // Pointer cursor for click action
videoButton.style.display = 'flex'; // Flex to center the icon
videoButton.style.alignItems = 'center'; // Center the icon vertically
videoButton.style.justifyContent = 'center'; // Center the icon horizontally
videoButton.style.width = '40px'; // Width of the button
videoButton.style.height = '40px'; // Height of the button
videoButton.style.color = 'white';

// Event listener for video on/off
videoButton.addEventListener('click', () => {
  if (this.myStream) {
    const videoTrack = this.myStream.getVideoTracks()[0];
    if (videoTrack.enabled) {
      videoTrack.enabled = false;
      videoIcon.className = 'fas fa-video-slash'; // Change to video off icon
    } else {
      videoTrack.enabled = true;
      videoIcon.className = 'fas fa-video'; // Change to video on icon
    }
  }
});

// Append both buttons to the container
buttonsContainer.appendChild(audioButton);
buttonsContainer.appendChild(videoButton);

// Append the container to the document body
document.body.appendChild(buttonsContainer);


  }
}
