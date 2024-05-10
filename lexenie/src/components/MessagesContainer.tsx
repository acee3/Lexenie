import React from 'react';
import { Message } from '../App';
import MessageBubble from './MessageBubble';

interface MessagesContainerProps {
  messages: Message[];
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-2 p-4">
      {messages.map(message => (
        <MessageBubble key={message.id} text={message.text} isSender={message.isSender} />
      ))}
    </div>
  );
};

export default MessagesContainer;
