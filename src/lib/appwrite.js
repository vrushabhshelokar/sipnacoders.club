import { Client, Account, Databases, Storage, ID } from 'appwrite';

export const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint if different
  .setProject('sipna-coders-club'); // Your Project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// --- Auth Functions ---
export async function loginWithGoogle() {
  try {
    await account.createOAuth2Session(
      'google',
      `${window.location.origin}/`, // Success
      `${window.location.origin}/login` // Failure
    );
  } catch (error) {
    console.error('Google login failed:', error);
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    window.location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}
