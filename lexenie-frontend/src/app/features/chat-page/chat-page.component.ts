import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextBubbleComponent } from '../../shared/components/text-bubble/text-bubble.component';
import { CoolButtonComponent } from '../../shared/components/cool-button/cool-button.component';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { audioMimeToExtension, ChatService, Conversation, Language, Message } from '../../core/chat.service';
import { Router } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AuthService } from '../../core/auth.service';
import { sample } from 'rxjs';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';


@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [FormsModule, TextBubbleComponent, NgOptimizedImage, ModalComponent, NgClass],
  templateUrl: './chat-page.component.html'
})
export class ChatPageComponent {
  isConversationModalVisible: boolean = false;

  constructor(private chatService: ChatService, private router: Router, private authService: AuthService) {
    try {
      this.chatService.connectErrorObservable().subscribe({
        next: (error) => {
          console.error(error);
          this.logout();
        }
      });

      this.chatService.errorObservable().subscribe({
        next: (error) => {
          console.warn(error);
          if (error.name === 'UnknownError') {
            console.error('Unknown error');
            this.logout();
          }
        }
      });

      this.chatService.disconnectObservable().subscribe({
        next: (reason) => {
          console.warn('Socket disconnected:', reason);
          this.logout();
        }
      });

      this.chatService.connect();
      
      this.chatService.getConversations().subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          if (this.conversations.length == 0)
            return;
          this.selectedConversation = this.conversations[0];
          console.log(this.selectedConversation.name);
          this.retrieveMessages(this.selectedConversation);
        },
        error: (err) => {
          throw new Error('Error getting conversations');
        }
      });
    } catch (e) {
      console.error(e);
      this.logout();
    }
  }

  logout() {
    this.authService.logout();
    if (this.mediaRecorder != null) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    this.router.navigate(['/auth/login']);
  }


  @ViewChild('chatBox') chatBox?: ElementRef<HTMLDivElement>;

  scrollToBottom(element: ElementRef<HTMLDivElement> | undefined): void {
    if (element)
      element.nativeElement.scrollTop = element.nativeElement.scrollHeight;
  }

  ngOnInit() {
    this.scrollToBottom(this.chatBox);
  }

  ngAfterViewChecked() {
    this.scrollToBottom(this.chatBox);
  } 
  

  conversations: Conversation[] = [];

  selectedConversation: Conversation | null = null;

  flipIsConversationModalVisible() {
    this.isConversationModalVisible = !this.isConversationModalVisible;
  }
  openConversationModal() {
    this.isConversationModalVisible = true;
  }
  newConversationName: string = '';
  newConversationLanguage: Language = 'English';
  languages: string[] = ["English", "Spanish", "French", "German", "Italian", "Mandarin", "Cantonese", "Japanese"];
  createConversation() {
    if (this.newConversationName.trim() && this.newConversationLanguage.trim()) {
      this.chatService.createConversation(this.newConversationName, this.newConversationLanguage).subscribe({
        next: (response) => {
          console.log(response);
          let conversation: Conversation = {
            conversationId: response.conversationId,
            name: response.name,
            lastTime: response.lastTime
          };
          this.conversations.push(conversation);
          this.selectedConversation = conversation;
          this.retrieveMessages(conversation);
          this.newConversationName = '';
          this.newConversationLanguage = 'English';
          this.flipIsConversationModalVisible();
        },
        error: (err) => {
          console.log(err);
          throw new Error('Error creating conversation');
        }
      });
    }
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.retrieveMessages(conversation);
  }


  messages: Message[] = [];

  retrieveMessages(conversation: Conversation) {
    this.chatService.retrieveMessages(conversation.conversationId).subscribe({
      next: (messages) => {
        messages.sort((a, b) => {
          return a.messageId - b.messageId;
        });
        this.messages = messages;
        console.log(messages);
      },
      error: (_) => {
        throw new Error('Error retrieving messages');
      }
    });
  }


  newMessage: string = '';
  tempMessageId: number = -1;

  isRecording: boolean = false;
  stream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;

  async handleRecord() {
    if (this.selectedConversation == null) {
      alert('No conversation selected. Can\'t record audio.');
      return;
    }

    if (!navigator.mediaDevices) {
      alert('Recording audio is not supported in this browser.');
      return;
    }
    if (this.mediaRecorder == null || this.stream == null) {
      await register(await connect());
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/wav' }) as unknown as MediaRecorder;
    }
    
    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      return;
    }

    const settings = this.stream?.getAudioTracks()[0].getSettings();
    const { sampleRate, channelCount, sampleSize } = settings;
    if (sampleRate == undefined || channelCount == undefined || sampleSize == undefined) {
      alert('Error getting audio settings');
      return;
    }
    const sampleSizeInBytes = sampleSize / 8;
    
    this.chatService.startRecording({
      conversationId: this.selectedConversation.conversationId,
      waveData: {
        sampleRate: sampleRate,
        numberChannels: channelCount,
        bytesPerSample: sampleSizeInBytes
      }
    });

    this.mediaRecorder.ondataavailable = (e) => {
      const reader = new FileReader();
      reader.onload = () => {
        const audioBlob = (reader.result as string).split(',')[1];
        const audioType = audioMimeToExtension.get(this.mediaRecorder?.mimeType);

        if (audioType == undefined)
          throw new Error('Unknown audio type');
        
        if (this.selectedConversation == null) {
          alert('No conversation selected. Can\'t transcribe audio.');
          return;
        }
        this.chatService.receiveAudioChunk(audioBlob).subscribe({
          next: (response) => {
            this.newMessage += response;
          },
          error: (_) => {
            throw new Error('Error sending audio chunk');
          }
        });
      }
      
      reader.readAsDataURL(e.data);
    };

    // Send audio chunks every 1s
    this.mediaRecorder.start(5000);
    this.isRecording = true;
  }

  sendMessage() {
    if (!this.newMessage.trim()) {
      alert('Message cannot be empty');
      return;
    }
    if (!this.selectedConversation) {
      alert('No conversation selected');
      return;
    }

    // The messageId is set to -1 because the actual messageId will be set by the server
    const newMessage: Message = {
      messageId: this.tempMessageId,
      conversationId: this.selectedConversation.conversationId,
      userId: this.authService.getUserId(),
      messageText: this.newMessage,
      createdAt: new Date()
    };
    this.tempMessageId -= 1;
    this.messages.push(newMessage);

    const messageText = this.newMessage;
    this.newMessage = '';

    this.chatService.sendMessage(this.selectedConversation.conversationId, messageText).subscribe({
      next: (message) => {
        this.messages.push(message);
      }
    });
  }
}
