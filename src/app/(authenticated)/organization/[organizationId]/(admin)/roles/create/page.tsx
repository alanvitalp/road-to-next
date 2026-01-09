import { Heading } from "@/components/heading";
import { CreateRoleForm } from "@/features/permission/components/create-role-form";

type CreateRolePageProps = {
  params: Promise<{
    organizationId: string;
  }>;
};

const CreateRolePage = async ({ params }: CreateRolePageProps) => {
  const { organizationId } = await params;

  return (
    <div className="flex flex-col flex-1 gap-y-8">
      <Heading
        title="Create Role"
        description="Create a new role with custom permissions"
      />

      <div className="max-w-2xl">
        <CreateRoleForm organizationId={organizationId} />
      </div>
    </div>
  );
};

export default CreateRolePage;
