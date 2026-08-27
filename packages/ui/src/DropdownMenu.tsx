"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { IconCheck, IconChevronRight, IconCircle, IconDotsVertical } from "@tabler/icons-react";
import { cn } from "./utils";

export const DropdownMenuRoot = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-[1px] px-2 py-1.5 text-xs outline-none focus:bg-[#CC6600]/20 data-[state=open]:bg-[#CC6600]/20",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <IconChevronRight size={14} stroke={1.5} className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-[2px] border border-white/15 bg-[#01142B] p-1 text-white shadow-xl backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-[2px] border border-white/15 bg-[#01142B]/95 p-1 text-white shadow-2xl backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-[1px] px-2 py-1.5 text-xs outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      variant === "destructive"
        ? "text-[#F87171] focus:bg-[#EF4444]/20 focus:text-white"
        : "text-white/90 focus:bg-[#CC6600]/20 focus:text-white",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-[1px] py-1.5 pl-8 pr-2 text-xs outline-none transition-colors focus:bg-[#CC6600]/20 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCheck size={14} stroke={2.5} className="text-[#CC6600]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-[1px] py-1.5 pl-8 pr-2 text-xs outline-none transition-colors focus:bg-[#CC6600]/20 focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <IconCircle size={8} className="fill-current text-[#CC6600]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-[0.688rem] font-mono uppercase tracking-wider text-white/50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-white/10", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-[0.625rem] tracking-widest text-white/40", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Backward-compatible High-Level Facade Component
export interface DropdownMenuItemConfig {
  key?: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  variant?: "default" | "warning" | "danger" | "success";
  disabled?: boolean;
  dividerBefore?: boolean;
  onClick: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItemConfig[];
  trigger?: React.ReactNode;
  align?: "start" | "end" | "left" | "right";
  width?: string;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  items,
  trigger,
  align = "end",
  width,
  className = "",
  isOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const normalizedAlign = align === "left" ? "start" : align === "right" ? "end" : align;

  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger ? (
          <div>{trigger}</div>
        ) : (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <IconDotsVertical size={16} stroke={1.5} />
          </button>
        )}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuContent
        align={normalizedAlign}
        className={cn("p-1", className)}
        style={{ width: width ?? undefined }}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.key ?? index}>
            {item.dividerBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={item.disabled}
              variant={item.variant === "danger" ? "destructive" : "default"}
              onClick={item.onClick}
              className="flex items-center gap-2 px-2.5 py-1.5"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <div className="flex flex-col flex-1">
                <span className="font-medium text-xs">{item.label}</span>
                {item.subtitle && (
                  <span className="text-[0.625rem] text-white/50">{item.subtitle}</span>
                )}
              </div>
              {item.badge && (
                <span className="ml-auto rounded-[2px] bg-white/10 px-1.5 py-0.5 text-[0.563rem] font-mono uppercase text-white/70">
                  {item.badge}
                </span>
              )}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenuPrimitive.Root>
  );
}
