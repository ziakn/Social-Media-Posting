import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  AlertTriangle,
  Image as ImageIcon,
  Link2,
  BarChart3,
  CreditCard,
  FileText,
  Users,
  HelpCircle,
  UserCog,
  Shield,
  Lock,
  Globe,
  Settings,
  Building2,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import { ROUTES } from "@/constants/routes"
import { API_ROUTES } from "@/constants/api"
import { useRouter } from "next/navigation"

export function AppSidebar({ user, ...props }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission } = usePermissions()

  const handleLogout = async () => {
    try {
      await fetch(API_ROUTES.LOGOUT, { method: 'POST' });
      document.cookie = 'token=; path=/; max-age=0';
      router.push(ROUTES.ADMIN_LOGIN);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Group A: Core SaaS (Primary)
  const coreNavItems = [
    {
      title: "Dashboard",
      url: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      permission: "view_dashboard",
    },
    {
      title: "Composer",
      url: "/admin/composer",
      icon: PenSquare,
      permission: "view_composer",
    },
    {
      title: "Scheduled",
      url: "/admin/scheduled",
      icon: Calendar,
      permission: "view_scheduled",
    },
    {
      title: "Failed",
      url: "/admin/failed",
      icon: AlertTriangle,
      permission: "view_failed",
    },
    {
      title: "Media Library",
      url: ROUTES.ADMIN_GALLERY,
      icon: ImageIcon,
      permission: "view_gallery",
    },
    {
      title: "Accounts",
      url: ROUTES.ADMIN_SOCIAL_CONNECT,
      icon: Link2,
      permission: "view_connect",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
      permission: "view_analytics",
    },
  ]

  // Group B: Business (Monetization)
  const businessNavItems = [
    {
      title: "Pricing Packages",
      url: "/admin/packages",
      icon: CreditCard,
      permission: "view_packages",
    },
    {
      title: "Billing & Plans",
      url: "/pricing",
      icon: CreditCard,
    },
    {
      title: "Invoices",
      url: "/admin/invoices",
      icon: FileText,
      permission: "view_invoices",
    },
    {
      title: "Team & Access",
      url: "/admin/team",
      icon: Users,
      permission: "view_users", // Keeping detailed permission check
    },
  ]

  // Group C: Support
  const supportNavItems = [
    {
      title: "Help Center",
      url: "/admin/help",
      icon: HelpCircle,
      permission: "view_help",
    },
  ]

  // Group D: System (Admin/Dev)
  const systemNavItems = [
    {
      title: "Users",
      url: ROUTES.ADMIN_USER,
      icon: UserCog,
      permission: "view_users",
    },
    {
      title: "Roles",
      url: ROUTES.ADMIN_ROLE,
      icon: Shield,
      permission: "view_roles",
    },
    {
      title: "Permissions",
      url: ROUTES.ADMIN_PERMISSION,
      icon: Lock,
      permission: "view_permissions",
    },
    {
      title: "Integrations",
      url: ROUTES.ADMIN_PLATFORMS,
      icon: Globe,
      permission: "view_plateforms",
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
      permission: "view_settings",
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">SocialHub</span>
            <span className="truncate text-xs">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Group A: Core SaaS */}
        <SidebarGroup>
          <SidebarGroupLabel>Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreNavItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) return null
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {/* Group B: Business */}
        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessNavItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) return null
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {/* Group C: Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNavItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) return null
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-2" />

        {/* Group D: System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => {
                if (item.permission && !hasPermission(item.permission)) return null
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton tooltip="Logout" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your current session and redirect you to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white border-none">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
