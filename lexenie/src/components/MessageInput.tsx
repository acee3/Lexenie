import React from 'react';

interface MessageInputProps {
  message: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({message, onInputChange, onSubmit, disabled }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
      <form className="flex items-center space-x-2" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg"
          value={message}
          onChange={onInputChange}
          disabled={disabled}
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded-lg disabled:bg-blue-300"
          disabled={disabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
