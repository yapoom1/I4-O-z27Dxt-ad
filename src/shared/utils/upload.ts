/**
 * Uploads a file to the backend and returns the public Vercel Blob URL.
 * 
 * @param {File} file - The file object from an input element.
 * @param {string} entityType - "product", "category", or "logo"
 * @param {string} token - The user's JWT Authorization token.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
export async function uploadMedia(file: File, entityType: string, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType);

  // Fallback to empty string or local dev URL if NEXT_PUBLIC_API_URL isn't set, 
  // since you're using Vite it might be VITE_API_URL. Adjust as needed.
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const response = await fetch(`${apiUrl}/api/media/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
      // Note: We intentionally omit Content-Type here so the browser sets the boundary correctly
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to upload file");
  }

  const data = await response.json();
  return data.url; // This is the final image URL you should save in GraphQL
}
