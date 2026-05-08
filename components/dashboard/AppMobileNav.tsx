import Link from "next/link";

import {
  getAppSidebarMenuItems,
  type AppSidebarActiveItem,
} from "@/components/dashboard/AppSidebar";

type AppMobileNavProps = {
  active: AppSidebarActiveItem;
  projectId?: string;
};

export function AppMobileNav({ active }: AppMobileNavProps) {
  const menuItems = getAppSidebarMenuItems();

  return (
    <nav className="border-b bg-white px-4 py-3 lg:hidden" aria-label="アプリ内ナビゲーション">
      <div className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1">
        {menuItems.map((item) => (
          <Link
            aria-current={active === item.label ? "page" : undefined}
            className={
              active === item.label
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-green-50 px-3 text-sm font-black text-green-700"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border bg-white px-3 text-sm font-bold text-zinc-600"
            }
            href={item.href}
            key={item.label}
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
