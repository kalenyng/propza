export interface Property {
  id: string;
  address: string;
  rent_amount: number;
  currency: string;
  status: 'vacant' | 'occupied';
  owner_id: string;
  name: string;
  created_at: string;
  tenants?: Array<{
    name: string;
    rent_status: 'paid' | 'overdue' | 'upcoming' | 'vacant';
    rent_due_date: string;
    rent_amount: number;
    lease_start_date: string | null;
    lease_end_date: string | null;
  }>;
}

export interface Payment {
  id: string;
  property_id: string;
  amount: number;
  period: string;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  paid_at: string;
  created_at: string;
}

