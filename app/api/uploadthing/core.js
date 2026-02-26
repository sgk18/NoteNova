import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Endpoint for heavy study materials (PDFs, PPTs, Images)
  courseResource: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.ms-powerpoint": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "32MB", maxFileCount: 1 }
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

      // !!! Note: Metadata save is handled by frontend calling /api/resources or /api/upload
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Endpoint for user profile pictures (Images)
  profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile picture uploaded:", file.url);
    }),
};
