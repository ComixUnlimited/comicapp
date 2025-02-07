import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Firebase Firestore initialization

// Function to update user profile in Firestore
export const updateProfile = async (userId, profile) => {
  try {
    await setDoc(doc(db, 'profiles', userId), profile); // Save profile to Firestore
    alert('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile.');
  }
};
