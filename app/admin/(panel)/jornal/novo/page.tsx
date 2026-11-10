import PostForm from "../PostForm";

export default function NewPostPage() {
  return (
    <PostForm
      initial={{
        slug: "",
        title: "",
        type: "noticia",
        date: new Date().toISOString().slice(0, 10),
        outlet: "",
        externalUrl: "",
        excerpt: "",
        body: "",
        cover: "",
        published: false,
      }}
    />
  );
}
