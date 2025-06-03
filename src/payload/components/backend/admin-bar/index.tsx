import { ChevronDown, PlusIcon, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link.js"
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Toaster } from "../../ui/sonner"
import ClearCache from "./clear-cache"
import EditCurrentPage from "./edit-current-page"
import Preview from "./exit-preview"
import "./styles.scss"

interface AdminBarProps {
  preview?: boolean
  user?: any
  settings?: any
}

const cmsURL = process.env.NEXT_PUBLIC_URL
export const revalidate = 0

/*******************************************************/
/* Wild Child Custom Admin Bar
/*******************************************************/

export async function WildChildAdminBar({ preview, user, settings }: AdminBarProps) {
  if (!user) return null

  return (
    <>
      <div className="admin-bar">
        {/* Left Menu Items */}
        <div className="admin-bar__left-menu">
          <DashboardLink />
          <SystemDropdown settings={settings} />
          <NewItemDropdown />
          <EditCurrentPage />
        </div>

        {/* Right Menu Items */}
        <div className="admin-bar__right-menu">
          <ClearCache />
          {preview && <Preview />}
          <UserDropdown user={user} />
        </div>
      </div>

      {/* Toaster For Cache */}
      <Toaster
        position="bottom-right"
        style={{
          background: "linear-gradient(90deg, #18181a 0%, #1c1c1f 100%)",
        }}
        icons={{
          success: <FaCheckCircle className="admin-bar__toaster-success-icon" />,
          error: <FaExclamationCircle className="admin-bar__toaster-error-icon" />,
        }}
        className="admin-bar-toaster"
      />
    </>
  )
}

/*******************************************************/
/* Items
/*******************************************************/

async function UserDropdown({ user }: { user?: any }) {
  if (!user) {
    return null
  }

  const { id: userID, email, firstName, lastName } = user
  const cmsURL = process.env.NEXT_PUBLIC_URL
  const displayName = firstName ? `${firstName}${lastName ? ` ${lastName}` : ""}` : email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="admin-bar__dropdown-trigger">
        <div className="admin-bar__dropdown-trigger">
          <div className="admin-bar__avatar-container--small">
            {user.avatar?.url && typeof user.avatar?.url === "string" ? (
              <Image
                src={user.avatar.url}
                alt={displayName || ""}
                width={24}
                height={24}
                className="admin-bar__avatar-image"
              />
            ) : (
              <User className="admin-bar__user-icon--small" />
            )}
          </div>
          <span>Howdy, {firstName || email?.split("@")[0]}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="admin-bar__dropdown-content admin-bar__dropdown-content--user">
        <div className="admin-bar__user-container">
          <div className="admin-bar__user-info">
            <div className="admin-bar__avatar-container">
              {user.avatar?.url && typeof user.avatar.url === "string" ? (
                <Image
                  src={user.avatar?.url}
                  alt={displayName || ""}
                  width={64}
                  height={64}
                  className="admin-bar__avatar-image"
                />
              ) : (
                <User className="admin-bar__user-icon--large" />
              )}
            </div>
            <div>
              <div className="admin-bar__user-text-name">{displayName}</div>
              <Link
                href={`${cmsURL}/admin/collections/users/${userID}`}
                className="admin-bar__user-text-link"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
        <DropdownMenuItem asChild className="admin-bar__menu-item">
          <Link href={`${cmsURL}/admin/logout`} className="admin-bar__menu-item-link">
            Log Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

async function DashboardLink() {
  return (
    <Link href={`${cmsURL}/admin`} className="admin-bar__dashboard-link">
      Dashboard
    </Link>
  )
}

async function SystemDropdown({ settings }: { settings?: any }) {
  if (!settings) return null

  const siteName = settings?.general?.siteName || "My Site"

  const systemItems = [
    {
      label: "Pages",
      href: `${cmsURL}/admin/collections/pages`,
    },
    {
      label: "Posts",
      href: `${cmsURL}/admin/collections/posts`,
    },
    {
      label: "Header",
      href: `${cmsURL}/admin/globals/header`,
    },
    {
      label: "Footer",
      href: `${cmsURL}/admin/globals/footer`,
    },
    {
      label: "Settings",
      href: `${cmsURL}/admin/globals/settings`,
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="admin-bar__dropdown-trigger">
        <span>{siteName}</span>
        <ChevronDown className="admin-bar__chevron-icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="admin-bar__dropdown-content">
        {systemItems.map(item => (
          <DropdownMenuItem key={item.label} asChild>
            <Link href={item.href} className="admin-bar__menu-item-link">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

async function NewItemDropdown() {
  const collections = [
    {
      slug: "pages",
      labels: {
        singular: "Page",
      },
    },
    {
      slug: "posts",
      labels: {
        singular: "Post",
      },
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="admin-bar__dropdown-trigger">
        <span className="admin-bar__dropdown-trigger-text">
          <PlusIcon className="admin-bar__plus-icon" /> New
        </span>
        <ChevronDown className="admin-bar__chevron-icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="admin-bar__dropdown-content">
        {collections.map(collection => (
          <DropdownMenuItem key={collection.slug} asChild>
            <Link
              href={`${cmsURL}/admin/collections/${collection.slug}/create`}
              className="admin-bar__menu-item-link"
            >
              {collection.labels?.singular || collection.slug}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
