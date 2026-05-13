export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property_id: string;
  rent_amount: number;
  rent_status: 'paid' | 'overdue' | 'upcoming' | 'vacant';
  rent_due_date: string;
  lease_start_date: string | null;
  lease_end_date: string | null;
  deposit_amount: number;
  notes: string | null;
  created_at: string;
  properties?: {
    address: string;
    owner_id?: string;
  };
}

