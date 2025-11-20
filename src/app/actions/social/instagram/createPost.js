// src/app/actions/social/instagram/createPost.js

"use server";

import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";

/**
 * Get Instagram Business Account ID and access token
 */
async function getInstagramAccount(pageId) {
  try {
    // Instagram requires a linked Facebook Page first
    const pageDoc = await getDoc(doc(db, "facebook_pages", pageId));
    if (!pageDoc.exists()) {
      throw new Error("Linked Facebook page not found");
    }
    
    const pageData = pageDoc.data();
    if (!pageData.instagram_business_account) {
      throw new Error("No Instagram Business Account linked to this page");
    }
    
    return {
      instagramId: pageData.instagram_business_account.id,
      accessToken: pageData.access_token
    };
  } catch (error) {
    throw new Error(`Failed to get Instagram account: ${error.message}`);
  }
}

/**
 * Upload file to Firebase Storage for Instagram
 */
async function uploadToFirebaseForInstagram(file, folder = "instagram") {
  try {
    // Instagram has specific file requirements
    if (file.type.startsWith('image/')) {
      // Validate image dimensions and format
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error("Instagram only supports JPEG and PNG images");
      }
    } else if (file.type.startsWith('video/')) {
      // Validate video requirements
      if (file.type !== 'video/mp4') {
        throw new Error("Instagram only supports MP4 videos");
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error("Video must be smaller than 100MB");
      }
    }
    
    const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * Make Instagram Graph API request
 */
async function makeInstagramRequest(endpoint, formData, accessToken) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0${endpoint}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `Instagram API error: ${response.status}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Instagram API request failed: ${error.message}`);
  }
}

/**
 * Create Instagram Container for media (required step)
 */
async function createMediaContainer(instagramId, mediaData, accessToken, isCarousel = false) {
  try {
    const formData = new FormData();
    
    if (mediaData.image_url) {
      formData.append("image_url", mediaData.image_url);
    } else if (mediaData.video_url) {
      formData.append("video_url", mediaData.video_url);
      formData.append("media_type", "VIDEO");
    }
    
    formData.append("caption", mediaData.caption || "");
    
    if (isCarousel && mediaData.children) {
      formData.append("children", mediaData.children.join(','));
      formData.append("media_type", "CAROUSEL");
    }
    
    // Check if scheduled
    if (mediaData.scheduled_publish_time) {
      formData.append("published", "false");
      formData.append("scheduled_publish_time", mediaData.scheduled_publish_time.toString());
    } else {
      formData.append("published", "false"); // Always false for container creation
    }

    const containerResponse = await makeInstagramRequest(
      `/${instagramId}/media`, 
      formData, 
      accessToken
    );

    return containerResponse.id;
  } catch (error) {
    throw new Error(`Failed to create media container: ${error.message}`);
  }
}

/**
 * Publish Instagram Container (second required step)
 */
async function publishMediaContainer(instagramId, containerId, accessToken) {
  try {
    const formData = new FormData();
    formData.append("creation_id", containerId);

    const publishResponse = await makeInstagramRequest(
      `/${instagramId}/media_publish`, 
      formData, 
      accessToken
    );

    return publishResponse;
  } catch (error) {
    throw new Error(`Failed to publish media: ${error.message}`);
  }
}

/**
 * Check media publishing status
 */
async function checkMediaStatus(instagramId, containerId, accessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to check media status: ${error.message}`);
  }
}

/**
 * Create Single Image Post for Instagram
 */
export async function createInstagramImagePost({ 
  pageId, 
  image, 
  caption, 
  scheduling 
}) {
  try {
    const { instagramId, accessToken } = await getInstagramAccount(pageId);

    // Upload image to Firebase
    const imageUrl = await uploadToFirebaseForInstagram(image.file, "instagram/images");

    // Prepare scheduling
    const scheduledTime = scheduling?.schedule 
      ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
      : null;

    // Step 1: Create media container
    const containerId = await createMediaContainer(instagramId, {
      image_url: imageUrl,
      caption: caption,
      scheduled_publish_time: scheduledTime
    }, accessToken);

    let publishResult = null;
    
    // Step 2: Publish immediately if not scheduled
    if (!scheduling?.schedule) {
      // Wait a moment for container processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check container status before publishing
      const status = await checkMediaStatus(instagramId, containerId, accessToken);
      
      if (status.status_code === 'FINISHED') {
        publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
      } else {
        throw new Error(`Media not ready for publishing. Status: ${status.status}`);
      }
    }

    // Save to Firestore
    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      instagramId,
      postType: "image",
      content: {
        caption,
        image: {
          url: imageUrl,
          name: image.name,
          type: image.type,
          size: image.size
        }
      },
      status: scheduling?.schedule ? "scheduled" : "published",
      scheduledAt: scheduling?.schedule ? new Date(`${scheduling.date}T${scheduling.time}`) : null,
      instagramContainerId: containerId,
      instagramPostId: publishResult?.id || null,
      metrics: {
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0
      }
    });

    return { 
      success: true, 
      data: { 
        containerId,
        instagramId: publishResult?.id,
        firestoreId,
        scheduled: !!scheduling?.schedule
      } 
    };

  } catch (error) {
    console.error("Instagram Image Post Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create Carousel Post for Instagram (Multiple Images)
 */
export async function createInstagramCarouselPost({ 
  pageId, 
  images, 
  caption, 
  scheduling 
}) {
  try {
    const { instagramId, accessToken } = await getInstagramAccount(pageId);

    if (!images || images.length < 2 || images.length > 10) {
      throw new Error("Carousel posts require 2-10 images");
    }

    // Upload all images to Firebase and create individual containers
    const childContainers = [];
    
    for (const image of images) {
      const imageUrl = await uploadToFirebaseForInstagram(image.file, "instagram/carousel");
      
      // Create container for each image (without caption - only main container gets caption)
      const childContainerId = await createMediaContainer(instagramId, {
        image_url: imageUrl,
        caption: "" // No caption for child items
      }, accessToken);
      
      childContainers.push(childContainerId);
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Prepare scheduling
    const scheduledTime = scheduling?.schedule 
      ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
      : null;

    // Step 3: Create main carousel container
    const carouselContainerId = await createMediaContainer(instagramId, {
      caption: caption,
      children: childContainers,
      scheduled_publish_time: scheduledTime
    }, accessToken, true);

    let publishResult = null;
    
    // Publish immediately if not scheduled
    if (!scheduling?.schedule) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const status = await checkMediaStatus(instagramId, carouselContainerId, accessToken);
      
      if (status.status_code === 'FINISHED') {
        publishResult = await publishMediaContainer(instagramId, carouselContainerId, accessToken);
      } else {
        throw new Error(`Carousel not ready for publishing. Status: ${status.status}`);
      }
    }

    // Save to Firestore
    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      instagramId,
      postType: "carousel",
      content: {
        caption,
        images: await Promise.all(images.map(async (image, index) => ({
          url: await uploadToFirebaseForInstagram(image.file, "instagram/carousel"),
          name: image.name,
          type: image.type,
          size: image.size,
          containerId: childContainers[index]
        }))),
        imageCount: images.length
      },
      status: scheduling?.schedule ? "scheduled" : "published",
      scheduledAt: scheduling?.schedule ? new Date(`${scheduling.date}T${scheduling.time}`) : null,
      instagramContainerId: carouselContainerId,
      instagramPostId: publishResult?.id || null,
      metrics: {
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0
      }
    });

    return { 
      success: true, 
      data: { 
        containerId: carouselContainerId,
        instagramId: publishResult?.id,
        firestoreId,
        scheduled: !!scheduling?.schedule,
        imageCount: images.length
      } 
    };

  } catch (error) {
    console.error("Instagram Carousel Post Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create Video Post for Instagram
 */
export async function createInstagramVideoPost({ 
  pageId, 
  video, 
  caption, 
  scheduling 
}) {
  try {
    const { instagramId, accessToken } = await getInstagramAccount(pageId);

    // Upload video to Firebase
    const videoUrl = await uploadToFirebaseForInstagram(video.file, "instagram/videos");

    // Prepare scheduling
    const scheduledTime = scheduling?.schedule 
      ? Math.floor(new Date(`${scheduling.date}T${scheduling.time}`).getTime() / 1000)
      : null;

    // Step 1: Create video container
    const containerId = await createMediaContainer(instagramId, {
      video_url: videoUrl,
      caption: caption,
      scheduled_publish_time: scheduledTime,
      media_type: "VIDEO"
    }, accessToken);

    let publishResult = null;
    
    // Videos take longer to process - wait more time
    if (!scheduling?.schedule) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds for video processing
      
      let status;
      let attempts = 0;
      
      // Poll for video processing status
      do {
        status = await checkMediaStatus(instagramId, containerId, accessToken);
        attempts++;
        
        if (status.status_code === 'FINISHED') {
          break;
        } else if (status.status_code === 'ERROR') {
          throw new Error(`Video processing failed: ${status.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
      } while (attempts < 12); // Max 1 minute wait
      
      if (status.status_code === 'FINISHED') {
        publishResult = await publishMediaContainer(instagramId, containerId, accessToken);
      } else {
        throw new Error(`Video not ready for publishing after 1 minute. Status: ${status.status}`);
      }
    }

    // Save to Firestore
    const firestoreId = await saveToFirestore({
      platform: "instagram",
      pageId,
      instagramId,
      postType: "video",
      content: {
        caption,
        video: {
          url: videoUrl,
          name: video.name,
          type: video.type,
          size: video.size,
          duration: video.duration // If available
        }
      },
      status: scheduling?.schedule ? "scheduled" : "published",
      scheduledAt: scheduling?.schedule ? new Date(`${scheduling.date}T${scheduling.time}`) : null,
      instagramContainerId: containerId,
      instagramPostId: publishResult?.id || null,
      metrics: {
        reach: 0,
        engagement: 0,
        views: 0,
        likes: 0,
        comments: 0
      }
    });

    return { 
      success: true, 
      data: { 
        containerId,
        instagramId: publishResult?.id,
        firestoreId,
        scheduled: !!scheduling?.schedule
      } 
    };

  } catch (error) {
    console.error("Instagram Video Post Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create Story Post for Instagram
 */
export async function createInstagramStory({ 
  pageId, 
  media, 
  caption 
}) {
  try {
    const { instagramId, accessToken } = await getInstagramAccount(pageId);

    // Stories cannot be scheduled - they publish immediately
    const mediaUrl = await uploadToFirebaseForInstagram(
      media.file, 
      media.type.startsWith('image/') ? "instagram/stories/images" : "instagram/stories/videos"
    );

    // Create story container
    const containerData = media.type.startsWith('image/') 
      ? { image_url: mediaUrl }
      : { video_url: mediaUrl, media_type: "VIDEO" };

    const containerId = await createMediaContainer(instagramId, {
      ...containerData,
      caption: caption,
      media_type: "STORIES"
    }, accessToken);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const status = await checkMediaStatus(instagramId, containerId, accessToken);
    
    if (status.status_code === 'FINISHED') {
      const publishResult = await publishMediaContainer(instagramId, containerId, accessToken);

      // Save to Firestore
      const firestoreId = await saveToFirestore({
        platform: "instagram",
        pageId,
        instagramId,
        postType: "story",
        content: {
          caption,
          media: {
            url: mediaUrl,
            name: media.name,
            type: media.type,
            size: media.size
          }
        },
        status: "published",
        instagramContainerId: containerId,
        instagramPostId: publishResult.id,
        metrics: {
          reach: 0,
          impressions: 0,
          replies: 0,
          exits: 0
        }
      });

      return { 
        success: true, 
        data: { 
          containerId,
          instagramId: publishResult.id,
          firestoreId
        } 
      };
    } else {
      throw new Error(`Story not ready for publishing. Status: ${status.status}`);
    }

  } catch (error) {
    console.error("Instagram Story Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save post to Firestore (helper function)
 */
async function saveToFirestore(postData) {
  try {
    const postRef = await addDoc(collection(db, "social_posts"), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return postRef.id;
  } catch (error) {
    throw new Error(`Failed to save post to database: ${error.message}`);
  }
}

/**
 * Get Instagram Insights for a post
 */
export async function getInstagramInsights(postId) {
  try {
    const postDoc = await getDoc(doc(db, "social_posts", postId));
    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const postData = postDoc.data();
    
    if (!postData.instagramPostId) {
      throw new Error("No Instagram post ID available");
    }

    const { accessToken } = await getInstagramAccount(postData.pageId);

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postData.instagramPostId}/insights?metric=impressions,reach,engagement,saved&access_token=${accessToken}`
    );

    const insights = await response.json();
    
    return { success: true, data: insights };
  } catch (error) {
    return { success: false, error: error.message };
  }
}