"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  SquareIcon,
  LockIcon,
  VoteIcon,
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

// This is sample data.
// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Monolith",
//       logo: SquareIcon,
//       plan: "Core",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Community",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Community",
//     },
//   ],
//   navMain: [
//     {
//       title: "Lock",
//       url: "/lock",
//       icon: LockIcon,
//       isActive: true,
//       items: [
//         {
//           title: "Ecosystem",
//           url: "/lock",
//         },
//         {
//           title: "Create New",
//           url: "/lock/create",
//         },
//       ],
//     },
//     {
//       title: "Proposal",
//       url: "/proposal",
//       icon: VoteIcon,
//       items: [
//         {
//           title: "See All",
//           url: "/proposal",
//         },
//         {
//           title: "Create New",
//           url: "/proposal/create",
//         },
//       ],
//     },
//     {
//       title: "Rewards",
//       url: "#",
//       icon: GiftIcon,
//       items: [
//         {
//           title: "See All",
//           url: "/asr",
//         },
//         {
//           title: "My Rewards",
//           url: "#",
//         },
//       ],
//     },
//   ],
// }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <LockSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/*
      <NavMain items={data.navMain} />
        */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
