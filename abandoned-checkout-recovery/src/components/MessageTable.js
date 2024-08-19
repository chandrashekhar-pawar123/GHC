import React, { useState, useEffect } from 'react';
import { fetchSentMessages } from '../services/api';

const MessageTable = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const getMessages = async () => {
      const response = await fetchSentMessages();
      setMessages(response.data);
    };
    getMessages();
  }, []);

  return (
    <div>
      <h2>Sent Messages</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Message Content</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg._id}>
              <td>{msg.email}</td>
              <td>{msg.messageContent}</td>
              <td>{new Date(msg.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageTable;