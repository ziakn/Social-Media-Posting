import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';

// Configure ffmpeg to use the static binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

/**
 * Get video metadata
 * @param {string} filePath - Absolute path to the video file
 * @returns {Promise<Object>} - Metadata object
 */
export async function checkVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(new Error("Failed to probe video file: " + err.message));
            }

            // Find video stream
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            if (!videoStream) {
                return reject(new Error("No video stream found in file"));
            }

            resolve({
                format: metadata.format.format_name,
                duration: metadata.format.duration, // seconds
                size: metadata.format.size, // bytes
                width: videoStream.width,
                height: videoStream.height,
                codec: videoStream.codec_name,
                audioCodec: audioStream ? audioStream.codec_name : null,
                bitrate: videoStream.bit_rate,
                fps: videoStream.r_frame_rate
            });
        });
    });
}

/**
 * Validate if a video is compliant with TikTok standards
 * @param {Object} metadata - Metadata from checkVideoMetadata
 * @returns {Object} - { compliant: boolean, reason: string }
 */
/**
 * Validate if a video is compliant with platform standards
 * @param {string} platform - 'tiktok', 'instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'pinterest'
 * @param {Object} metadata - Metadata from checkVideoMetadata
 * @returns {Object} - { compliant: boolean, reason: string }
 */
export function validatePlatformCompliance(platform, metadata) {
    const reasons = [];
    const p = platform.toLowerCase();

    // Universal Standards (Safe for all)
    // Codec: H.264 (almost all APIs require or prefer this)
    // Container: MP4 (almost all APIs require or prefer this)
    // Audio: AAC

    // Check Codec (Universal Requirement for best success)
    if (metadata.codec !== 'h264') {
        reasons.push(`Invalid video codec: ${metadata.codec} (Requires h264 for ${platform})`);
    }

    // Check Audio Codec
    if (metadata.audioCodec && metadata.audioCodec !== 'aac') {
        reasons.push(`Invalid audio codec: ${metadata.audioCodec} (Requires aac for ${platform})`);
    }

    // Check File Extension / Format
    const format = metadata.format || "";
    if (!format.includes('mp4') && !format.includes('mov')) {
        reasons.push(`Invalid container format: ${metadata.format} (Requires mp4 or mov)`);
    }

    const duration = parseFloat(metadata.duration);

    // Platform Specific Limits (Approximate API limits)
    switch (p) {
        case 'tiktok':
            if (duration < 3) reasons.push(`Video too short for TikTok: ${duration}s (Min 3s)`);
            if (duration > 600) reasons.push(`Video too long for TikTok: ${duration}s (Max 10m)`); // API varies, 10m is effective max
            break;
        case 'instagram': // Reels / Feed
            if (duration < 3) reasons.push(`Video too short for Instagram: ${duration}s (Min 3s)`);
            if (duration > 900) reasons.push(`Video too long for Instagram: ${duration}s (Max 15m)`);
            break;
        case 'facebook': // Reels / Feed
            // Very flexible on feed, strict on reels. Let's aim for safe feed limit.
            if (duration > 14400) reasons.push(`Video too long for Facebook (Max 4h)`);
            break;
        case 'youtube': // Shorts vs Long
            // YouTube handles almost anything, but API uploads still prefer h264 for instant processing.
            break;
        case 'twitter': // X
            if (duration > 140) reasons.push(`Video too long for Twitter: ${duration}s (Max 140s standard)`);
            break;
        case 'linkedin':
            if (duration < 3) reasons.push(`Video too short for LinkedIn: ${duration}s (Min 3s)`);
            if (duration > 600) reasons.push(`Video too long for LinkedIn: ${duration}s (Max 10m recommended)`);
            break;
        case 'pinterest':
            if (duration < 4) reasons.push(`Video too short for Pinterest: ${duration}s (Min 4s)`);
            if (duration > 900) reasons.push(`Video too long for Pinterest: ${duration}s (Max 15m)`);
            break;
        case 'threads':
            if (duration > 300) reasons.push(`Video too long for Threads: ${duration}s (Max 5m)`);
            break;
    }

    return {
        compliant: reasons.length === 0,
        reasons
    };
}

/**
 * Convert video to Platform compliant format (Universal H.264/AAC/MP4)
 * @param {string} inputPath - Absolute path to input
 * @param {string} outputPath - Absolute path for output
 * @returns {Promise<Object>} - Result
 */
export async function convertVideoForPlatform(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        // Ensure output dir exists (defensive)
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            // Should exist usually, but failsafe
            try { fs.mkdirSync(outputDir, { recursive: true }); } catch (e) { }
        }

        ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
            .outputOptions([
                '-preset fast', // Balance speed vs quality
                '-movflags +faststart', // Optimize for web streaming
                '-pix_fmt yuv420p', // Ensure broad compatibility
                '-vf scale=\'trunc(iw/2)*2:trunc(ih/2)*2\'' // Ensure dimensions are even (libx264 req)
            ])
            .on('end', () => {
                console.log('Video conversion completed:', outputPath);
                resolve({ success: true, outputPath });
            })
            .on('error', (err) => {
                console.error('Video conversion error:', err);
                reject(err);
            })
            .save(outputPath);
    });
}
