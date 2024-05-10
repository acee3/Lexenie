import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import MessagesContainer from './components/MessagesContainer';
import MessageInput from './components/MessageInput';

export interface Message {
  id: number;
  text: string;
  isSender: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [curMessage, setCurMessage] = useState<string>('');
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Message Sent:", curMessage);
    setMessages([...messages, {id: messages.length, text: curMessage, isSender: true}]);
    setCurMessage('');
    setInputDisabled(true);

    // Simulate receiving a message response (you would use actual logic in a real app)
    setTimeout(() => {
      setInputDisabled(false);
      console.log("Response received");
    }, 3000); // Simulates a delay before receiving a response
  };

  return (
    <div className="">
      <Header loggedIn={false} />
      <MessagesContainer messages={messages} />
      <MessageInput message={curMessage} onInputChange={handleInputChange} onSubmit={handleSubmit} disabled={inputDisabled}/>
    </div>
  );
}

export default App;
