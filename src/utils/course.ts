/**
 * Get a human-readable label for a lesson completion trigger.
 *
 * @param trigger - The completion trigger type
 * @returns French label (e.g., "Auto vidéo", "Manuel")
 */
export function getCompletionTriggerLabel(trigger: string): string {
  switch (trigger) {
    case "auto_video":
      return "Auto vidéo";
    case "auto_scroll":
      return "Auto lecture";
    case "auto_time":
      return "Auto temps";
    case "manual":
      return "Manuel";
    default:
      return trigger;
  }
}

/**
 * Get the file extension from a file name.
 *
 * @param fileName - The file name
 * @returns Uppercase file extension (e.g., "PDF", "MP4")
 */
export function getFileExtension(fileName: string): string {
  if (!fileName || !fileName.includes(".")) return "UNKNOWN";
  return fileName.split(".").pop()!.toUpperCase();
}
