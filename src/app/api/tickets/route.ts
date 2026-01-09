import { NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { getOrganizationsByUser } from "@/features/organization/queries/get-organization-by-users";
import { getTickets } from "@/features/ticket/queries/get-tickets";
import { searchParamsCache } from "@/features/ticket/search-params";

export async function GET(request: Request) {
  const auth = await getAuth();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizations = await getOrganizationsByUser();
  const activeOrganization = organizations.find(
    (org) => org.membershipByUser.isActive,
  );

  if (!activeOrganization) {
    return NextResponse.json(
      { error: "No active organization" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const untypedSearchParams = Object.fromEntries(searchParams);
  const typedSearchParams = searchParamsCache.parse(untypedSearchParams);

  const { list, metadata } = await getTickets(
    undefined,
    true,
    typedSearchParams,
  );

  return Response.json({ list, metadata });
}
