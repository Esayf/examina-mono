export function getSnippet(question: string, maxLen = 13) {
  if (!question || question.trim() === "") {
    return "No content available"; // Boşsa gösterilecek mesaj
  }
  const trimmed = question.trim();
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) + "..." : trimmed;
}
