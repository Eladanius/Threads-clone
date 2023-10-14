'use server';

import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.model';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';

interface Props {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({ text, author, communityId, path }: Props) {
  try {
    connectToDB();

    const createThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, { $push: { threads: createThread._id } });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    //Fetch the posts that have no parents (top-level threads...)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .populate({ path: 'author', model: User })
      .populate({
        path: 'children',
        populate: { path: 'author', model: User, select: '_id name parentId image' },
      });

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return {
      posts,
      isNext,
    };
  } catch (error: any) {
    throw new Error(`Error fetch posts: ${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          { path: 'author', model: User, select: '_id id name parentId image' },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectToDB();
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error('Thread not found');
    }

    //Create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    //Save the thread
    const savedCommentThread = await commentThread.save();

    //Update the original thread to include the new comment
    originalThread.children.push(savedCommentThread._id);

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error add comment: ${error.message}`);
  }
}
