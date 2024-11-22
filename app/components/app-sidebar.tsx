"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  SquareIcon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LockIcon,
  VoteIcon,
  GemIcon,
  GiftIcon
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { LockSwitcher } from "@/components/lock-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Skeleton } from "./ui/skeleton"
import { LockContext } from "./LockContextProvider"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Monolith",
      logo: SquareIcon,
      plan: "Core",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Community",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Community",
    },
  ],
  navMain: [
    {
      title: "Lock",
      url: "#",
      icon: LockIcon,
      isActive: true,
      items: [
        {
          title: "Ecosystem",
          url: "/lock",
        },
        {
          title: "Create New",
          url: "/lock/create",
        },
      ],
    },
    {
      title: "Proposal",
      url: "/proposal",
      icon: VoteIcon,
      items: [
        {
          title: "See All",
          url: "/proposal",
        },
        {
          title: "Create New",
          url: "/proposal/create",
        },
      ],
    },
    {
      title: "Rewards",
      url: "#",
      icon: GiftIcon,
      items: [
        {
          title: "See All",
          url: "/asr",
        },
        {
          title: "My Rewards",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { locks } = React.useContext(LockContext);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {locks ? <LockSwitcher locks={locks} /> : <Skeleton />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
