import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${id}`).then((res) => setPost(res.data.post)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  if (!post) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Post nahi mila.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <PostCard post={post} />
      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostDetail;
