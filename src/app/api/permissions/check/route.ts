import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import type { PermissionKey } from "@/features/permission/constants";
import { hasPermission } from "@/features/permission/utils/has-permission";

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");
    const permissionKey = searchParams.get("permissionKey") as PermissionKey;

    if (!userId || !organizationId || !permissionKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Users can only check their own permissions unless they're admins
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const hasPermissionValue = await hasPermission(
      userId,
      organizationId,
      permissionKey
    );

    return NextResponse.json({
      hasPermission: hasPermissionValue,
    });
  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
