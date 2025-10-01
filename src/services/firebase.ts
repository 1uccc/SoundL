import { 
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Song, Playlist, User } from '../types';

// Auth Services
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData.displayName || firebaseUser.displayName || 'Anonymous',
          avatar: userData.avatar || '',
          playlists: userData.playlists || [],
          role: userData.role || 'user'
        };
        return { user, success: true };
      } else {
        // Create user document if it doesn't exist
        const newUserData = {
          displayName: firebaseUser.displayName || 'Anonymous',
          avatar: '',
          playlists: [],
          createdAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUserData);
        
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: newUserData.displayName,
          avatar: newUserData.avatar,
          playlists: []
        };
        
        return { user, success: true };
      }
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      
      // If it's a permission error, still return the user but without Firestore data
      if (firestoreError.code === 'permission-denied') {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          avatar: '',
          playlists: []
        };
        
        console.warn('Firestore permissions denied, using Firebase Auth data only');
        return { user, success: true };
      }
      
      throw firestoreError;
    }
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/user-not-found') {
      throw new Error('Không tìm thấy tài khoản với email này');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Mật khẩu không đúng');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email không hợp lệ');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }
    
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const createUserWithEmailAndPassword = async (
  email: string, 
  password: string, 
  displayName: string
) => {
  try {
    const userCredential = await firebaseCreateUser(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update profile
    await updateProfile(firebaseUser, { displayName });
    
    // Create user document in Firestore
    const userData = {
      displayName,
      avatar: '',
      playlists: [],
      createdAt: serverTimestamp()
    };
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, userData);
    
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName,
      avatar: '',
      playlists: []
    };
    
    return { user, success: true };
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    let userData;
    if (!userDoc.exists()) {
      // Create new user document
      userData = {
        displayName: firebaseUser.displayName || 'Anonymous',
        avatar: firebaseUser.photoURL || '',
        playlists: [],
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, userData);
    } else {
      userData = userDoc.data();
    }
    
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: userData.displayName || firebaseUser.displayName || 'Anonymous',
      avatar: userData.avatar || firebaseUser.photoURL || '',
      playlists: userData.playlists || []
    };
    
    return { user, success: true };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy');
    }
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    let userData;
    if (!userDoc.exists()) {
      // Create new user document
      userData = {
        displayName: firebaseUser.displayName || 'Anonymous',
        avatar: firebaseUser.photoURL || '',
        playlists: [],
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, userData);
    } else {
      userData = userDoc.data();
    }
    
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: userData.displayName || firebaseUser.displayName || 'Anonymous',
      avatar: userData.avatar || firebaseUser.photoURL || '',
      playlists: userData.playlists || []
    };
    
    return { user, success: true };
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('Tài khoản đã tồn tại với phương thức đăng nhập khác');
    }
    throw new Error(error.message || 'Failed to sign in with Facebook');
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Firestore Services

// Get all public playlists
export const getPublicPlaylists = async (): Promise<Playlist[]> => {
  try {
    const playlistsQuery = query(
      collection(db, 'playlists'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(playlistsQuery);
    const playlists: Playlist[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();
        
        // Get songs for this playlist
        const songs: Song[] = [];
        if (data.songIds && data.songIds.length > 0) {
          for (const songId of data.songIds) {
            try {
              const songDocRef = doc(db, 'songs', songId);
              const songDoc = await getDoc(songDocRef);
              if (songDoc.exists()) {
                const songData = songDoc.data();
                if (songData.isActive !== false) {
                  songs.push({ id: songDoc.id, ...songData } as Song);
                }
              }
            } catch (songError) {
              console.error(`Error fetching song ${songId}:`, songError);
            }
          }
        }
        
        playlists.push({
          id: docSnapshot.id,
          name: data.name || 'Untitled Playlist',
          description: data.description || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          songs,
          createdBy: data.createdBy,
          userId: data.createdBy,
          createdAt: convertTimestamp(data.createdAt),
          isPublic: data.isPublic || false
        });
      } catch (playlistError) {
        console.error(`Error processing playlist ${docSnapshot.id}:`, playlistError);
      }
    }
    
    return playlists;
  } catch (error: any) {
    console.error('Get public playlists error:', error);
    return [];
  }
};

export const getUserPlaylists = async (userId: string): Promise<Playlist[]> => {
  try {
    const playlistsQuery = query(
      collection(db, 'playlists'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(playlistsQuery);
    const playlists: Playlist[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      try {
        const data = docSnapshot.data();
        
        // Get songs for this playlist
        const songs: Song[] = [];
        if (data.songIds && data.songIds.length > 0) {
          for (const songId of data.songIds) {
            try {
              const songDocRef = doc(db, 'songs', songId);
              const songDoc = await getDoc(songDocRef);
              if (songDoc.exists()) {
                songs.push({ id: songDoc.id, ...songDoc.data() } as Song);
              }
            } catch (songError) {
              console.error(`Error fetching song ${songId}:`, songError);
              // Continue with other songs if one fails
            }
          }
        }
        
        playlists.push({
          id: docSnapshot.id,
          name: data.name || 'Untitled Playlist',
          description: data.description || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          songs,
          createdBy: data.createdBy,
          userId: data.createdBy,
          createdAt: convertTimestamp(data.createdAt),
          isPublic: data.isPublic || false
        });
      } catch (playlistError) {
        console.error(`Error processing playlist ${docSnapshot.id}:`, playlistError);
        // Continue with other playlists if one fails
      }
    }
    
    return playlists;
  } catch (error: any) {
    console.error('Get user playlists error:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
};

// Get all accessible playlists for a user (own + public)
export const getAllAccessiblePlaylists = async (userId: string): Promise<Playlist[]> => {
  try {
    const [userPlaylists, publicPlaylists] = await Promise.all([
      getUserPlaylists(userId),
      getPublicPlaylists()
    ]);
    
    // Merge and remove duplicates
    const allPlaylists = [...userPlaylists];
    const userPlaylistIds = new Set(userPlaylists.map(p => p.id));
    
    publicPlaylists.forEach(playlist => {
      if (!userPlaylistIds.has(playlist.id)) {
        allPlaylists.push(playlist);
      }
    });
    
    return allPlaylists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error: any) {
    console.error('Get all accessible playlists error:', error);
    return [];
  }
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation. For production, consider using Algolia or Elasticsearch
    const songsRef = collection(db, 'songs');
    const querySnapshot = await getDocs(songsRef);
    
    const songs: Song[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const song = { id: doc.id, ...data } as Song;
      
      // Simple client-side filtering
      if (
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album.toLowerCase().includes(query.toLowerCase())
      ) {
        songs.push(song);
      }
    });
    
    return songs;
  } catch (error: any) {
    console.error('Search songs error:', error);
    throw new Error('Failed to search songs');
  }
};

export const createPlaylist = async (playlist: Omit<Playlist, 'id' | 'createdAt'>): Promise<Playlist> => {
  try {
    // First, ensure all songs exist in the database
    const songIds: string[] = [];
    for (const song of playlist.songs) {
      // Check if song exists
      const songDocRef = doc(db, 'songs', song.id);
      const songDoc = await getDoc(songDocRef);
      if (!songDoc.exists()) {
        // Create song document if it doesn't exist
        await setDoc(songDocRef, {
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          imageUrl: song.imageUrl,
          audioUrl: song.audioUrl,
          genre: song.genre
        });
      }
      songIds.push(song.id);
    }
    
    const playlistData = {
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.imageUrl,
      songIds,
      createdBy: playlist.createdBy,
      createdAt: serverTimestamp(),
      isPublic: playlist.isPublic
    };
    
    const docRef = await addDoc(collection(db, 'playlists'), playlistData);
    
    const newPlaylist: Playlist = {
      id: docRef.id,
      name: playlist.name,
      description: playlist.description,
      imageUrl: playlist.imageUrl,
      songs: playlist.songs,
      createdBy: playlist.createdBy,
      createdAt: new Date(),
      isPublic: playlist.isPublic
    };
    
    return newPlaylist;
  } catch (error: any) {
    console.error('Create playlist error:', error);
    throw new Error('Failed to create playlist');
  }
};

export const updatePlaylist = async (playlistId: string, updates: Partial<Playlist>): Promise<Playlist> => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    if (!playlistDoc.exists()) {
      throw new Error('Playlist not found');
    }
    
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.imageUrl) updateData.imageUrl = updates.imageUrl;
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
    
    if (updates.songs) {
      // Update song references
      const songIds: string[] = [];
      for (const song of updates.songs) {
        // Ensure song exists in database
        const songDocRef = doc(db, 'songs', song.id);
        const songDoc = await getDoc(songDocRef);
        if (!songDoc.exists()) {
          await setDoc(songDocRef, {
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            imageUrl: song.imageUrl,
            audioUrl: song.audioUrl,
            genre: song.genre
          });
        }
        songIds.push(song.id);
      }
      updateData.songIds = songIds;
    }
    
    await updateDoc(playlistRef, updateData);
    
    // Return updated playlist
    const updatedDoc = await getDoc(playlistRef);
    const data = updatedDoc.data()!;
    
    // Get songs
    const songs: Song[] = [];
    if (data.songIds) {
      for (const songId of data.songIds) {
        const songDocRef = doc(db, 'songs', songId);
        const songDoc = await getDoc(songDocRef);
        if (songDoc.exists()) {
          songs.push({ id: songDoc.id, ...songDoc.data() } as Song);
        }
      }
    }
    
    return {
      id: updatedDoc.id,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      songs,
      createdBy: data.createdBy,
      createdAt: convertTimestamp(data.createdAt),
      isPublic: data.isPublic || false
    };
  } catch (error: any) {
    console.error('Update playlist error:', error);
    throw new Error('Failed to update playlist');
  }
};

export const deletePlaylist = async (playlistId: string): Promise<void> => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    await deleteDoc(playlistRef);
  } catch (error: any) {
    console.error('Delete playlist error:', error);
    throw new Error('Failed to delete playlist');
  }
};

// Utility function to get current user
export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get user info by ID
export const getUserInfo = async (userId: string): Promise<{ displayName: string; avatar: string } | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || 'Unknown User',
        avatar: userData.avatar || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

// Admin functions
export const addSong = async (songData: Omit<Song, 'id'>): Promise<Song> => {
  try {
    const songsCollection = collection(db, 'songs');
    const docRef = await addDoc(songsCollection, {
      ...songData,
      createdAt: serverTimestamp(),
      isActive: true
    });
    
    const newSong: Song = {
      id: docRef.id,
      ...songData
    };
    
    return newSong;
  } catch (error: any) {
    console.error('Error adding song:', error);
    throw new Error(error.message || 'Failed to add song');
  }
};

export const updateSong = async (songId: string, updates: Partial<Song>): Promise<void> => {
  try {
    const songDocRef = doc(db, 'songs', songId);
    await updateDoc(songDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error updating song:', error);
    throw new Error(error.message || 'Failed to update song');
  }
};

export const deleteSong = async (songId: string): Promise<void> => {
  try {
    const songDocRef = doc(db, 'songs', songId);
    // Soft delete by setting isActive to false
    await updateDoc(songDocRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error deleting song:', error);
    throw new Error(error.message || 'Failed to delete song');
  }
};

export const getAllSongs = async (): Promise<Song[]> => {
  try {
    const songsCollection = collection(db, 'songs');
    const songsQuery = query(
      songsCollection,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(songsQuery);
    const songs: Song[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      songs.push({
        id: doc.id,
        title: data.title || '',
        artist: data.artist || '',
        album: data.album || '',
        duration: data.duration || 0,
        imageUrl: data.imageUrl || '',
        audioUrl: data.audioUrl || '',
        youtubeUrl: data.youtubeUrl || '',
        sourceType: data.sourceType || 'file',
        genre: data.genre || '',
        createdBy: data.createdBy,
        createdAt: convertTimestamp(data.createdAt),
        isActive: data.isActive !== false
      });
    });
    
    return songs;
  } catch (error: any) {
    console.error('Error fetching songs:', error);
    throw new Error(error.message || 'Failed to fetch songs');
  }
};

// Favorites functions
export const getUserFavorites = async (userId: string): Promise<Song[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    const favoriteIds = userData.favorites || [];
    
    const favorites: Song[] = [];
    for (const songId of favoriteIds) {
      const songDocRef = doc(db, 'songs', songId);
      const songDoc = await getDoc(songDocRef);
      if (songDoc.exists()) {
        const data = songDoc.data();
        favorites.push({
          id: songDoc.id,
          title: data.title || '',
          artist: data.artist || '',
          album: data.album || '',
          duration: data.duration || 0,
          imageUrl: data.imageUrl || '',
          audioUrl: data.audioUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          sourceType: data.sourceType || 'file',
          genre: data.genre || '',
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt),
          isActive: data.isActive !== false
        });
      }
    }
    
    return favorites;
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    throw new Error(error.message || 'Failed to fetch favorites');
  }
};

export const addToFavorites = async (userId: string, songId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    
    if (!favorites.includes(songId)) {
      favorites.push(songId);
      await updateDoc(userRef, { favorites });
    }
  } catch (error: any) {
    console.error('Error adding to favorites:', error);
    throw new Error(error.message || 'Failed to add to favorites');
  }
};

export const removeFromFavorites = async (userId: string, songId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    
    const updatedFavorites = favorites.filter((id: string) => id !== songId);
    await updateDoc(userRef, { favorites: updatedFavorites });
  } catch (error: any) {
    console.error('Error removing from favorites:', error);
    throw new Error(error.message || 'Failed to remove from favorites');
  }
};

export const isFavorite = async (userId: string, songId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    const favorites = userData.favorites || [];
    return favorites.includes(songId);
  } catch (error: any) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Add song to playlist function
export const addSongToPlaylist = async (playlistId: string, songId: string): Promise<void> => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    if (!playlistDoc.exists()) {
      throw new Error('Playlist not found');
    }
    
    const playlistData = playlistDoc.data();
    const songIds = playlistData.songIds || [];
    
    if (!songIds.includes(songId)) {
      songIds.push(songId);
      await updateDoc(playlistRef, { songIds });
    }
  } catch (error: any) {
    console.error('Error adding song to playlist:', error);
    throw new Error(error.message || 'Failed to add song to playlist');
  }
};