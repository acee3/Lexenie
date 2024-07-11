import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextBubbleComponent } from '../../shared/components/text-bubble/text-bubble.component';
import { CoolButtonComponent } from '../../shared/components/cool-button/cool-button.component';
import { NgOptimizedImage } from '@angular/common';

interface Message {
  messageId: number;
  conversationId: number;
  userId: number;
  messageText: string;
  createdAt: Date;
  translation?: string;
}

interface Conversation {
  conversationId: number;
  title: string;
  messages: Message[];
}


@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [FormsModule, TextBubbleComponent, CoolButtonComponent, NgOptimizedImage],
  templateUrl: './chat-page.component.html'
})
export class ChatPageComponent {
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
  

  conversations: Conversation[] = [
    {
      conversationId: 1,
      title: 'Conversation 1',
      messages: [
        {
          messageId: 1,
          conversationId: 1,
          userId: 1,
          messageText: 'Hello, buddy! What do you want to talk about?',
          createdAt: new Date()
        },
        {
          messageId: 2,
          conversationId: 1,
          userId: 2,
          messageText: 'You\'re stupid!',
          createdAt: new Date()
        }
      ]
    },
    {
      conversationId: 2,
      title: 'Conversation 2',
      messages: [
        {
          messageId: 3,
          conversationId: 2,
          userId: 1,
          messageText: 'Hello, friend! What do you want to talk about?',
          createdAt: new Date()
        },
        {
          messageId: 4,
          conversationId: 2,
          userId: 2,
          messageText: 'You\'re funny!',
          createdAt: new Date()
        }
      ]
    }
  ];

  selectedConversation: Conversation = this.conversations[0];
  newMessage: string = '';

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }


  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;

  async handleRecord() {
    if (!navigator.mediaDevices) {
      alert('Recording audio is not supported in this browser.');
      return;
    }
    if (this.mediaRecorder == null) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
    }
    
    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder
      this.isRecording = false;
      return;
    }

    this.mediaRecorder.ondataavailable = (e) => {
      console.log(e.data);
      console.log(typeof e.data);
      const reader = new FileReader();
      reader.onload = () => {
        const audioBlob = reader.result;
        console.log(typeof audioBlob);
      }
      reader.readAsDataURL(e.data);
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }


  sendMessage() {
    if (this.newMessage.trim() && this.selectedConversation) {
      this.selectedConversation.messages.push({
        messageId: this.selectedConversation.messages.length * -1 - 1,
        conversationId: this.selectedConversation.conversationId,
        userId: 2,
        messageText: this.newMessage,
        createdAt: new Date()
      });
      this.newMessage = '';
    }
  }
}
