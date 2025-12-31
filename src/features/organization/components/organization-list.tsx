import { getAuth } from "@/features/auth/queries/get-auth";
import { getOrganizationsByUser } from "../queries/get-organization-by-users";


const OrganizationList = async () => {
  const { user } = await getAuth();
  const organizations = await getOrganizationsByUser(user?.id);

  return (
    <div className="animate-fade-from-top">
      {organizations.map((organization) => (
        <div key={organization.id}>
          <div>Name: {organization.name}</div>
        </div>
      ))}
    </div>
  );
};

export { OrganizationList };