// app/api/admin/upload/route.js
import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request) {
  try {
    console.log('Upload API called');
    
    // Check if storage is initialized
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    
    console.log('Files received:', files.length);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file size
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds 100MB limit` },
          { status: 400 }
        );
      }

      try {
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `facebook/${timestamp}-${safeFileName}`;
        
        console.log('Creating storage reference for path:', filePath);
        
        // Create storage reference
        const storageRef = ref(storage, filePath);
        
        // Convert file to buffer
        const buffer = await file.arrayBuffer();
        
        console.log('Starting upload...');
        
        // Upload with metadata
        const snapshot = await uploadBytes(storageRef, buffer, {
          contentType: file.type,
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          }
        });
        
        console.log('Upload successful, getting download URL...');
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('Download URL obtained');
        
        uploadedFiles.push({
          url: downloadURL,
          type: file.type,
          name: file.name,
          size: file.size,
          path: filePath,
        });
        
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        
        // More detailed error logging
        if (fileError.code) {
          console.error('Firebase error code:', fileError.code);
        }
        if (fileError.message) {
          console.error('Firebase error message:', fileError.message);
        }
        if (fileError.customData) {
          console.error('Firebase custom data:', fileError.customData);
        }
        
        throw new Error(`Failed to upload ${file.name}: ${fileError.message}`);
      }
    }
    
    console.log('All files uploaded successfully. Total:', uploadedFiles.length);
    
    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    });
    
  } catch (error) {
    console.error('Upload API Error Details:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.customData) {
      console.error('Custom data:', error.customData);
    }

    let statusCode = 500;
    let errorMessage = error.message;
    
    // Handle specific Firebase Storage errors
    switch (error.code) {
      case 'storage/unknown':
        errorMessage = 'Firebase Storage configuration error. Please check your Firebase project settings.';
        statusCode = 503;
        break;
      case 'storage/unauthorized':
        errorMessage = 'Storage access denied. Check Firebase Storage security rules.';
        statusCode = 403;
        break;
      case 'storage/retry-limit-exceeded':
        errorMessage = 'Upload failed after multiple attempts. Please try again.';
        statusCode = 503;
        break;
      case 'storage/canceled':
        errorMessage = 'Upload was canceled.';
        statusCode = 400;
        break;
      default:
        errorMessage = `Upload failed: ${error.message}`;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          stack: error.stack
        } : undefined
      },
      { status: statusCode }
    );
  }
}