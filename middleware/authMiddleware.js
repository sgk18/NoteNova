import { verifyToken } from "@/lib/auth";

export async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}
