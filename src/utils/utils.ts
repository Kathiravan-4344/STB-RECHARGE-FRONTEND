import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanMobile(v: string) {
  return (v || "").trim().replace(/\D/g, "");
}

export function mobileToEmail(mobile: string) {
  return `${cleanMobile(mobile)}@stb-recharge.app`;
}
