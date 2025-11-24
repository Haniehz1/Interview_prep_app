import { type RoleLabel } from '../App';

interface RoleSelectorProps {
  selectedRole?: RoleLabel;
  onSelectRole: (role: RoleLabel) => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRole, onSelectRole, disabled }: RoleSelectorProps) {
  const roles: RoleLabel[] = [
    'AI Product Manager',
    'Engineering Manager',
    'Product Designer'
  ];

  return (
    <div className="flex flex-col gap-2">
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => onSelectRole(role)}
          disabled={disabled}
          className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
            selectedRole === role
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
