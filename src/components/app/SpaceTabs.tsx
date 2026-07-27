import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceMemberList, type SpaceMemberRow } from "./SpaceMemberList";
import { Compass, Newspaper, GraduationCap, Calendar, Users, BookOpen, MessageSquare } from "lucide-react";
import { SpaceDiscoveryTab } from "./SpaceDiscoveryTab";
import type { Space } from "@/lib/spaces";
import { FeedList } from "@/components/feed/FeedList";
import { SpaceCoursesTab } from "./SpaceCoursesTab";
import { UpcomingEventsWidget } from "@/components/events/UpcomingEventsWidget";
import { SpaceChatPanel } from "@/components/chat/SpaceChatPanel";
import { SpaceResourcesTab } from "./SpaceResourcesTab";

export function SpaceTabs({ space, members, isMember }: { space: Space; members: SpaceMemberRow[]; isMember: boolean }) {
  return (
    <Tabs defaultValue="discovery" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="discovery"><Compass className="size-4 mr-1.5" />Discovery</TabsTrigger>
        <TabsTrigger value="feed"><Newspaper className="size-4 mr-1.5" />Feed</TabsTrigger>
        <TabsTrigger value="courses"><GraduationCap className="size-4 mr-1.5" />Courses</TabsTrigger>
        <TabsTrigger value="events"><Calendar className="size-4 mr-1.5" />Events</TabsTrigger>
        <TabsTrigger value="chat"><MessageSquare className="size-4 mr-1.5" />Chat</TabsTrigger>
        <TabsTrigger value="members"><Users className="size-4 mr-1.5" />Members</TabsTrigger>
        <TabsTrigger value="resources"><BookOpen className="size-4 mr-1.5" />Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="discovery">
        <SpaceDiscoveryTab spaceId={space.id} spaceName={space.name} />
      </TabsContent>

      <TabsContent value="feed">
        <FeedList
          scopeSpaceId={space.id}
          joinableSpaces={[space]}
          showFilters
          emptyTitle={`No posts in ${space.name} yet`}
          emptyDescription="Be the first to start the conversation."
        />
      </TabsContent>
      <TabsContent value="courses">
        <SpaceCoursesTab spaceId={space.id} />
      </TabsContent>
      <TabsContent value="events">
        <UpcomingEventsWidget spaceId={space.id} limit={10} />
      </TabsContent>
      <TabsContent value="chat">
        <SpaceChatPanel spaceId={space.id} enabled={space.chat_enabled} isMember={isMember} />
      </TabsContent>
      <TabsContent value="members">
        <SpaceMemberList members={members} />
      </TabsContent>
      <TabsContent value="resources">
        <SpaceResourcesTab spaceId={space.id} />
      </TabsContent>
    </Tabs>
  );
}