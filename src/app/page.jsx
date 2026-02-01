import { Feed } from "@/components/feed/Feed";
import { StoryRail } from "@/components/stories/StoryRail";
import { getStories } from "@/actions/story";
import "@/components/stories/StoryRail";

export default async function Home() {
  const stories = await getStories()

  return (
    <div className="flex flex-col min-h-screen">
      <StoryRail stories={stories} />
      <Feed />
    </div>
  );
}
