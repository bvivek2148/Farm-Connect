import * as React from "react"
import { cn } from "@/lib/utils"

// Temporary fallback components - replace with radix-ui when available
const ContextMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <div className={cn("context-menu", className)} {...props}>{children}</div>
const ContextMenuItem = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => 
  <div className={cn("context-menu-item", className)} {...props}>{children}</div>
const ContextMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuRadioItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuSeparator = () => <div className="border-t" />
const ContextMenuShortcut = ({ children }: { children: React.ReactNode }) => <span>{children}</span>
const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuSub = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuSubContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const ContextMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

// Export all components

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
