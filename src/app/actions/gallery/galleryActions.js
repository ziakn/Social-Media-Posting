// src/app/actions/gallery/galleryActions.js
"use server";

import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = await verifyToken(token);

    if (!user) {
      throw new Error('Invalid token');
    }

    return user;
  } catch (error) {
    throw new Error('Authentication required: ' + error.message);
  }
}

// Upload file to gallery
// Create gallery item (metadata only)
export async function createGalleryItem(fileData) {
  try {
    const user = await getAuthenticatedUser();

    const {
      fileName,
      fileUrl,
      fileType,
      fileSize,
      storagePath,
      description = '',
      tags = [],
      category = 'general'
    } = fileData;

    // Determine media type
    let mediaType = 'document';
    if (fileType.startsWith('image/')) mediaType = 'image';
    if (fileType.startsWith('video/')) mediaType = 'video';

    // Create gallery record
    const galleryItem = {
      userId: user.id,
      fileName,
      fileUrl,
      fileType,
      mediaType,
      fileSize,
      storagePath,
      thumbnailUrl: fileUrl, // For now use same URL, could be different if we had resizing
      description,
      tags,
      category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'gallery'), galleryItem);

    return {
      success: true,
      id: docRef.id,
      ...galleryItem
    };

  } catch (error) {
    console.error('Create gallery item error:', error);
    throw error;
  }
}

// Get user's gallery items
export async function getUserGallery(options = {}) {
  try {
    const user = await getAuthenticatedUser();

    const {
      category = '',
      mediaType = '',
      limit = 50,
      page = 1
    } = options;

    let q = query(
      collection(db, 'gallery'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    // Apply filters
    if (category) {
      q = query(q, where('category', '==', category));
    }
    if (mediaType && mediaType !== 'all') {
      q = query(q, where('mediaType', '==', mediaType));
    }

    const querySnapshot = await getDocs(q);
    const items = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to Date if it exists
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      });
    });

    return {
      success: true,
      items,
      total: items.length
    };

  } catch (error) {
    console.error('Get user gallery error:', error);
    throw error;
  }
}

// Delete gallery item
export async function deleteGalleryItem(itemId) {
  try {
    const user = await getAuthenticatedUser();

    // Get the item first to check ownership
    const itemRef = doc(db, 'gallery', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      throw new Error('Gallery item not found');
    }

    const item = itemSnap.data();

    // Verify ownership
    if (item.userId !== user.id) {
      throw new Error('Unauthorized to delete this item');
    }

    // Delete from storage
    const storageRef = ref(storage, item.storagePath);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(itemRef);

    return { success: true, message: 'Item deleted successfully' };

  } catch (error) {
    console.error('Delete gallery item error:', error);
    throw error;
  }
}

// Update gallery item metadata
export async function updateGalleryItem(itemId, updates) {
  try {
    const user = await getAuthenticatedUser();

    const itemRef = doc(db, 'gallery', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      throw new Error('Gallery item not found');
    }

    const item = itemSnap.data();

    // Verify ownership
    if (item.userId !== user.id) {
      throw new Error('Unauthorized to update this item');
    }

    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Item updated successfully' };

  } catch (error) {
    console.error('Update gallery item error:', error);
    throw error;
  }
}

// Get gallery item by ID
export async function getGalleryItem(itemId) {
  try {
    const user = await getAuthenticatedUser();

    const itemRef = doc(db, 'gallery', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      throw new Error('Gallery item not found');
    }

    const item = itemSnap.data();

    // Verify ownership
    if (item.userId !== user.id) {
      throw new Error('Unauthorized to access this item');
    }

    return {
      success: true,
      item: {
        id: itemSnap.id,
        ...item,
        createdAt: item.createdAt?.toDate?.() || null,
        updatedAt: item.updatedAt?.toDate?.() || null
      }
    };

  } catch (error) {
    console.error('Get gallery item error:', error);
    throw error;
  }
}