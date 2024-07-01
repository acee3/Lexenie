import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

interface Message {
  sender: string;
  text: string;
}

interface Conversation {
  title: string;
  messages: Message[];
}


@Component({
  selector: 'chat-page',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './chat-page.component.html'
})
export class ChatPageComponent {
  conversations: Conversation[] = [
    { title: 'Conversation 1', messages: [{ sender: 'me', text: 'Hello!' }, { sender: 'them', text: 'Hi there!' }] },
    { title: 'Conversation 2', messages: [{ sender: 'me', text: 'How are you?' }, { sender: 'them', text: 'Good, you?' }] }
  ];

  selectedConversation: Conversation | null = this.conversations[0];
  newMessage: string = '';

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedConversation) {
      this.selectedConversation.messages.push({ sender: 'me', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
