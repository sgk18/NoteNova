import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseResource: f({ 
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    blob: { maxFileSize: "10MB", maxFileCount: 1 }
  })
    // Set permissions and file types for this route
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // For now, we return a dummy user. You can integrate auth here later.
      return { userId: "anonymous_for_now" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);

      // !!! Note: Metadata save is handled by frontend calling /api/resources
      return { uploadedBy: metadata.userId };
    }),
};
