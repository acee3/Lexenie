// THIS FILE IS INCOMPLETE AND NOT USED IN THE PROJECT

import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

// Uncomment when the service is complete
// @Injectable({
//   providedIn: 'root'
// })
export class AudioRecordingService {
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  async startRecording(chunkPeriod: number = 2000) {
    if (this.isRecording) {
      return false;
    }
    if (!navigator.mediaDevices) {
      alert('Recording audio is not supported in this browser.');
      return false;
    }
    if (this.mediaRecorder == null || this.stream == null) {
      await register(await connect());
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/wav' }) as unknown as MediaRecorder;
    }
    return true;

    // TODO: finish rest of the service
  }
}
