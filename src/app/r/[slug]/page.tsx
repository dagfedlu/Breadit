import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { notFound } from "next/navigation";
import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session = await getAuthSession();

  // finding data that matches
  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  //   if subreddit is not found
  if (!subreddit) return notFound();

  return (
  <>
    <h1 className='font-bold text-3xl md:text-4xl h-14'>
        r/{subreddit.name}
    </h1>
    {/* add a component that allows users to participate - mini post inside the subreddit */}
    <MiniCreatePost session={session} />
    {/* show posts after refresh */}
     <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} /> 
  </>
  );
};

export default page;
