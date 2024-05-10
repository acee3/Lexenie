import React from 'react';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isSender }) => {
  return (
    <div className={`max-w-[60%] ${isSender ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-300 text-black'} rounded-lg px-4 py-2`}>
      {text}
    </div>
  );
};

export default MessageBubble;
