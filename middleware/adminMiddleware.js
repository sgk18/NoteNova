import { verifyToken } from "@/lib/auth";

/**
 * Authenticate a request and verify the user has admin role.
 * Returns decoded token payload if admin, null otherwise.
 */
export async function authenticateAdmin(request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== "admin") {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}
