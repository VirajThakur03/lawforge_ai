// src/phase6/panic/WebRTCStreamer.js
import { IPFSEncryptor } from './IPFSEncryptor';

const STUN_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export class WebRTCStreamer {
  static pc = null;
  static mediaRecorder = null;
  static recordedChunks = [];
  static activeStream = null;

  /**
   * Starts video & audio capture, returning the stream.
   */
  static async startCapture() {
    try {
      // Try capturing video and audio, fallback to audio only if camera is blocked/unavailable
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true
      }).catch(async () => {
        console.warn("Camera capture failed, falling back to audio-only stream.");
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      });
      
      this.activeStream = stream;
      return stream;
    } catch (e) {
      console.error("Failed to capture user media:", e);
      throw e;
    }
  }

  /**
   * Initializes WebRTC connection and creates an offer payload.
   */
  static async createOffer(stream) {
    this.pc = new RTCPeerConnection(STUN_CONFIG);
    
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track, stream);
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete before capturing full description
    await new Promise((resolve) => {
      if (this.pc.iceGatheringState === 'complete') resolve();
      this.pc.onicegatheringstatechange = () => {
        if (this.pc.iceGatheringState === 'complete') resolve();
      };
    });

    return btoa(JSON.stringify(this.pc.localDescription));
  }

  /**
   * Starts a background recorder. Every 5 seconds, segments are encrypted and uploaded to IPFS.
   */
  static startRecording(stream, password, onChunkUploaded) {
    this.recordedChunks = [];
    if (!stream) return;

    try {
      // Choose supported media type
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'; // fallback if no video track exists
      }

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const chunk = event.data;
          console.log(`Captured stream chunk: ${chunk.size} bytes`);
          
          try {
            // Encrypt and upload
            const encrypted = await IPFSEncryptor.encryptBlob(chunk, password);
            const ipfsRecord = await IPFSEncryptor.uploadToIPFS(encrypted);
            
            if (onChunkUploaded) {
              onChunkUploaded(ipfsRecord);
            }
          } catch (err) {
            console.error("Failed to process segment chunk:", err);
          }
        }
      };

      // Segment every 4 seconds
      this.mediaRecorder.start(4000);
      console.log("MediaRecorder started recording segments.");
    } catch (e) {
      console.error("Failed to start media recorder:", e);
    }
  }

  /**
   * Stops recording and clean up tracks.
   */
  static stopAll() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    console.log("WebRTCStreamer cleaned up and stopped.");
  }
}
