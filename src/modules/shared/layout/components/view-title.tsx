/**
 * View title utility — delegates to the shared getViewTitle in @/utils/navigation.
 * This re-export exists so layout consumers can import from a single location
 * if they need the view-title mapping independently of the TopBar.
 */
export { getViewTitle } from "@/utils/navigation";
