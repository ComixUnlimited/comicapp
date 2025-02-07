import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Assuming firebase is set up
import { collection, doc, getDoc, setDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const MessagesPage = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({}); // To store friend profiles by UID

  // Fetch user's friends and their profiles
  useEffect(() => {
    const fetchFriends = async () => {
      console.log('Fetching friends list...');
      const userRef = doc(db, 'profiles', user.uid);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data fetched:', userData);
          setFriends(userData.friends || []);

          // Fetch each friend's profile data (PFP and username)
          const friendProfilesData = {};
          for (let friendUid of userData.friends || []) {
            const friendRef = doc(db, 'profiles', friendUid);
            try {
              const friendDoc = await getDoc(friendRef);
              if (friendDoc.exists()) {
                const friendData = friendDoc.data();
                friendProfilesData[friendUid] = {
                  username: friendData.username,
                  pfp: friendData.profilePicture || 'default-pfp-url', // Use default if no PFP
                };
              } else {
                console.log(`Friend profile not found for UID: ${friendUid}`);
              }
            } catch (error) {
              console.error('Error fetching friend profile:', error);
            }
          }
          setFriendProfiles(friendProfilesData); // Save the fetched profiles
        } else {
          console.log('User profile not found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchFriends();
  }, [user]);

  // Fetch messages with a selected friend
  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages...');
      if (selectedFriend) {
        try {
          const messagesRef = collection(db, 'messages');
          const q = query(
            messagesRef,
            where('participants', 'array-contains', user.uid),
            orderBy('timestamp', 'asc') // Ensure messages are ordered by timestamp (ascending)
          );
          const querySnapshot = await getDocs(q);
          const msgs = querySnapshot.docs.map(doc => doc.data());
          console.log('Messages fetched:', msgs);
          setMessages(msgs);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();
  }, [selectedFriend, user]);

  // Send a message to a friend
  const sendMessage = async () => {
    if (message.trim() === '') return;

    console.log('Sending message...');
    try {
      const messagesRef = collection(db, 'messages');
      const newMessage = {
        sender: user.uid,
        receiver: selectedFriend,
        message,
        timestamp: new Date(),
        participants: [user.uid, selectedFriend],
      };

      // Add message to Firestore
      const messageRef = doc(messagesRef);
      await setDoc(messageRef, newMessage);
      console.log('Message sent:', newMessage);

      // Clear message input
      setMessage('');
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="messages">
      <h2>Messages</h2>

      {/* Friend List */}
      <div className="friend-list">
        <h3>Select a Friend</h3>
        <ul>
          {friends.map(friendUid => (
            <li 
              key={friendUid}
              className={selectedFriend === friendUid ? 'selected' : ''}
              onClick={() => setSelectedFriend(friendUid)}
            >
              {/* Friend Profile Picture and Username */}
              {friendProfiles[friendUid] ? (
                <>
                  <img 
                    src={friendProfiles[friendUid].pfp} 
                    alt={friendProfiles[friendUid].username} 
                    className="friend-pfp" 
                  />
                  <span className="friend-username">{friendProfiles[friendUid].username}</span>
                </>
              ) : (
                <span>Loading...</span> // Placeholder if profile data is not yet available
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Message Section */}
      {selectedFriend && (
        <div className="message-section">
          <h3>Chat with {friendProfiles[selectedFriend]?.username}</h3>

          {/* Messages Display */}
          <div className="message-display">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === user.uid ? 'sent' : 'received'}`}
              >
                <span className="message-text">{msg.message}</span>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="message-input">
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-textarea"
            />
            <button onClick={sendMessage} className="send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
