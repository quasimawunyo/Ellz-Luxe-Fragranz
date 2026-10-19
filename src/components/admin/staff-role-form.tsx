import { ActionForm } from "@/components/forms/form-status";
import { updateStaffRoleAction } from "@/app/actions/staff";
import { USER_ROLES, roleLabel, type UserRole } from "@/lib/auth/roles";

export function StaffRoleForm({ userId, role }: { userId: string; role: UserRole }) {
  return (
    <ActionForm action={updateStaffRoleAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label="Role"
        className="min-h-11 rounded-xl border border-espresso/15 bg-white px-3 text-sm"
      >
        {USER_ROLES.map((value) => (
          <option key={value} value={value}>
            {roleLabel(value)}
          </option>
        ))}
      </select>
      <button type="submit" className="min-h-11 rounded-full bg-leaf px-4 text-sm text-white hover:bg-leaf/90">
        Save
      </button>
    </ActionForm>
  );
}
