import { authRoles } from './roles.js'

export default function RoleSelector({ selectedRole, onSelect, disabledRoles = [], disabledRoleDetails = {} }) {
  return (
    <div className="role-list" role="group" aria-label="Choose your role">
      {authRoles.map(({ id, title, detail, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={`role-option ${selectedRole === id ? 'role-selected' : ''} ${disabledRoles.includes(id) ? 'role-disabled' : ''}`}
          disabled={disabledRoles.includes(id)}
          onClick={() => onSelect(id)}
          aria-pressed={selectedRole === id}
        >
          <span className="role-icon"><Icon size={19} /></span>
          <span className="role-copy"><strong>{title}</strong><small>{disabledRoleDetails[id] || detail}</small></span>
          <span className="radio-dot" />
        </button>
      ))}
    </div>
  )
}
