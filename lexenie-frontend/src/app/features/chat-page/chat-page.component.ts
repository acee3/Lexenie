import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextBubbleComponent } from '../../shared/components/text-bubble/text-bubble.component';
import { CoolButtonComponent } from '../../shared/components/cool-button/cool-button.component';
import { NgOptimizedImage } from '@angular/common';
import { ChatService, Conversation } from '../../core/chat.service';
import { Router } from '@angular/router';


@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [FormsModule, TextBubbleComponent, CoolButtonComponent, NgOptimizedImage],
  templateUrl: './chat-page.component.html'
})
export class ChatPageComponent {
  constructor(private chatService: ChatService, private router: Router) {
    try {
      this.chatService.connectErrorObservable().subscribe({
        next: (error) => {
          console.error(error);
          // this.router.navigate(['/auth/login']);
        }
      });

      this.chatService.errorObservable().subscribe({
        next: (error) => {
          if (error.name === 'UnknownError')
            console.error('Unknown error');
            // this.router.navigate(['/auth/login']);
        }
      });

      this.chatService.connect();
      
      this.chatService.getConversations().subscribe({
        next: (conversations) => {
          alert('Got conversations ' + conversations);
          this.conversations = conversations;
          this.selectedConversation = this.conversations[0];
        },
        error: (err) => {
          alert('Error getting conversations ' + err);
          throw new Error('Error getting conversations');
        }
      });
    } catch (e) {
      alert('Error getting conversations ' + e);
    }
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
    console.log(this.chatService.isConnected());
    if (this.newMessage.trim() && this.selectedConversation) {
      // this.selectedConversation.messages.push({
      //   messageId: this.selectedConversation.messages.length * -1 - 1,
      //   conversationId: this.selectedConversation.conversationId,
      //   userId: 2,
      //   messageText: this.newMessage,
      //   createdAt: new Date()
      // });
      // this.newMessage = '';
    }
  }
}
