import mongoose from 'mongoose';
import Post from '../model/postSchema.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function fixComments() {
  try {
    // Find all posts
    const posts = await Post.find();

    for (const post of posts) {
      let needsUpdate = false;

      // Check each comment
      for (let i = 0; i < post.comment.length; i++) {
        const comment = post.comment[i];

        // Check if this is a malformed comment (has numeric keys)
        if ('0' in comment && !('text' in comment)) {
          // This is a malformed comment, reconstruct it
          let commentText = '';
          for (let j = 0; j < Object.keys(comment).length; j++) {
            if (j.toString() in comment) {
              commentText += comment[j.toString()];
            }
          }

          // Create a proper comment object
          post.comment[i] = {
            user: post.user, // Assuming the post creator is the commenter
            text: commentText.trim(),
            created_at: comment.created_at || new Date(),
          };

          needsUpdate = true;
        }
      }

      // Save the post if we made changes
      if (needsUpdate) {
        await post.save();
        console.log(`Fixed comments for post ${post._id}`);
      }
    }

    console.log('All comments fixed!');
  } catch (error) {
    console.error('Error fixing comments:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the fix
fixComments();
