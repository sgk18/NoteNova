import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Bookmark from "@/models/Bookmark";
import Rating from "@/models/Rating";
import Doubt from "@/models/Doubt";
import FlashcardProgress from "@/models/FlashcardProgress";
import Notification from "@/models/Notification";
import { authenticateAdmin } from "@/middleware/adminMiddleware";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * GET /api/admin/documents
 * Returns all resources with uploader info. Supports ?search= query param.
 */
export async function GET(request) {
    try {
        const admin = await authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const resourceType = searchParams.get("resourceType") || "";

        const query = { isPublic: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (resourceType) {
            query.resourceType = resourceType;
        }

        const resources = await Resource.find(query)
            .sort({ createdAt: -1 })
            .populate("uploadedBy", "name email department")
            .lean();

        // Get summary stats
        const totalCount = await Resource.countDocuments({ isPublic: true });
        const typeCounts = await Resource.aggregate([
            { $match: { isPublic: true } },
            { $group: { _id: "$resourceType", count: { $sum: 1 } } },
        ]);

        return NextResponse.json({
            resources,
            stats: {
                total: totalCount,
                byType: typeCounts.reduce((acc, t) => {
                    acc[t._id || "Unknown"] = t.count;
                    return acc;
                }, {}),
            },
        });
    } catch (err) {
        console.error("Admin documents GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/documents?id=<resourceId>
 * Permanently deletes a resource from MongoDB and UploadThing storage.
 */
export async function DELETE(request) {
    try {
        const admin = await authenticateAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const resourceId = searchParams.get("id");
        if (!resourceId) {
            return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
        }

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return NextResponse.json({ error: "Resource not found" }, { status: 404 });
        }

        // Try to delete from UploadThing storage
        if (resource.fileUrl && resource.fileUrl.includes("utfs.io")) {
            try {
                // Extract the file key from the UploadThing URL
                // URL format: https://utfs.io/f/<fileKey>
                const urlParts = resource.fileUrl.split("/f/");
                if (urlParts.length > 1) {
                    const fileKey = urlParts[1];
                    await utapi.deleteFiles(fileKey);
                }
            } catch (storageErr) {
                console.error("UploadThing delete error (continuing):", storageErr.message);
                // Continue with DB deletion even if storage deletion fails
            }
        }

        // Cascade-delete all related data from all users
        await Promise.all([
            Bookmark.deleteMany({ resourceId: resourceId }),
            Rating.deleteMany({ resourceId: resourceId }),
            Doubt.deleteMany({ resourceId: resourceId }),
            FlashcardProgress.deleteMany({ resourceId: resourceId }),
            Notification.deleteMany({ resourceId: resourceId }),
        ]);

        // Delete from MongoDB
        await Resource.findByIdAndDelete(resourceId);

        console.log(`[ADMIN] Document deleted by ${admin.email}: ${resource.title} (${resourceId})`);

        return NextResponse.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error("Admin document DELETE error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
