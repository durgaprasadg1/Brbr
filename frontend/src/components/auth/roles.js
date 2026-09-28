import { ShieldCheck, Store, Users } from 'lucide-react'

export const authRoles = [
  { id: 'customer', title: 'Customer', detail: 'Find a chair and skip the wait', icon: Users },
  { id: 'owner', title: 'Shop owner', detail: 'Manage your shop and queue', icon: Store },
  { id: 'admin', title: 'Administrator', detail: 'Platform administration', icon: ShieldCheck },
]
