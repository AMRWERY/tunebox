export type Variant =
  | "primary" // solid emerald (play)
  | "accent" // light emerald (theme toggle)
  | "ghost" // transparent, hover tint (skip, clear all)
  | "toggle" // ghost that turns emerald when `active`
  | "danger" // soft red (remove selected)
  | "danger-ghost" // faint, turns red on hover (remove track)
  | "plain"; // no look of its own (text-style buttons)

export type Size = "none" | "xs" | "sm" | "md" | "lg" | "pill";
