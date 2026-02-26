import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// Define your File Router for NoteNova
export const ourFileRouter = {
    // Endpoint for heavy study materials (PDFs, PPTs, Images)
    courseResource: f({
        pdf: { maxFileSize: "32MB", maxFileCount: 1 },
        image: { maxFileSize: "8MB", maxFileCount: 1 },
        "application/vnd.ms-powerpoint": { maxFileSize: "32MB", maxFileCount: 1 },
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "32MB", maxFileCount: 1 }
    })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after the direct-to-cloud upload finishes
            console.log("Upload complete for URL:", file.url);

            // You can return data to the frontend here
            return { uploadedUrl: file.url };
        }),

    // Endpoint for user profile pictures (Images)
    profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Profile picture uploaded:", file.url);
        }),
};
