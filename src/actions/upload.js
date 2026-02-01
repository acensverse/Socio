'use server';

import { uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function uploadMedia(formData, type) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file');
  if (!file) {
    throw new Error('No file provided');
  }

  const rawContent = formData.get('content') || '';
  const content = (typeof rawContent === 'string' ? rawContent : '').trim();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Convert buffer to base64 for Cloudinary upload
  const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  const folder = type === 'post' ? 'posts' : 'stories';
  const resourceType = file.type.startsWith('video') ? 'video' : 'image';

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error(`User ${session.user.id} not found in database. Session might be stale.`);
      return { success: false, error: 'User session invalid. Please log out and log back in.' };
    }

    const uploadResult = await uploadToCloudinary(fileBase64, folder, resourceType);

    if (type === 'post') {
      await prisma.post.create({
        data: {
          content,
          mediaUrl: uploadResult.secure_url,
          mediaType: resourceType,
          authorId: session.user.id,
        },
      });
    } else {
      await prisma.story.create({
        data: {
          mediaUrl: uploadResult.secure_url,
          authorId: session.user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });
    }

    revalidatePath('/');
    return { success: true, url: uploadResult.secure_url };
  } catch (error) {
    console.error('Upload action error:', error);
    return { success: false, error: 'Failed to upload media. See server logs for details.' };
  }
}

export async function updateProfileImage(formData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file');
  if (!file) {
    throw new Error('No file provided');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error(`User ${session.user.id} not found. Session might be stale.`);
      return { success: false, error: 'User session invalid. Please log out and log back in.' };
    }

    const uploadResult = await uploadToCloudinary(fileBase64, 'avatars', 'image');
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: uploadResult.secure_url },
    });

    revalidatePath('/profile');
    return { success: true, url: uploadResult.secure_url };
  } catch (error) {
    console.error('Update profile image error:', error);
    return { success: false, error: 'Failed to update profile image' };
  }
}
