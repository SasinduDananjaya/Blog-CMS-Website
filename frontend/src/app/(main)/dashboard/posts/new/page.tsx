import { PostForm } from "@/components/posts/post-form";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PostForm mode="create" />
    </div>
  );
}
