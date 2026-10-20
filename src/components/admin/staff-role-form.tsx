import { ActionForm } from "@/components/forms/form-status";
import { updateStaffRoleAction } from "@/app/actions/staff";
import { USER_ROLES, roleLabel, type UserRole } from "@/lib/auth/roles";

export function StaffRoleForm({ userId, role }: { userId: string; role: UserRole }) {
  return (
    <ActionForm action={updateStaffRoleAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label="Role"
        className="min-h-11 w-full rounded-xl border border-espresso/15 bg-white px-3 text-sm sm:w-auto"
      >
        {USER_ROLES.map((value) => (
          <option key={value} value={value}>
            {roleLabel(value)}
          </option>
        ))}
      </select>
      <button type="submit" className="min-h-11 w-full rounded-full bg-leaf px-4 text-sm text-white hover:bg-leaf/90 sm:w-auto">
        Save
      </button>
    </ActionForm>
  );
}
