
export interface User { 
  id: number;
  name: string;
  email: string | null;
  role: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category: string | null;
  commodity_type: string | null;
  brand_name: string | null;
  model_name: string | null;
  serial_number: string | null;
  location: string | null;
  status: string | null;
  is_active: boolean;
  created_at: string;
  assigned_users: User[];
}
export interface AssetSummary {
  id: number;
  asset_code: string;
  name: string;
  commodity_type: string | null;
  brand_name: string | null;
  location: string | null;
  status: string | null;
  is_active: boolean;
}

export interface UserWithAssets {
  id: number;
  name: string;
  email: string | null;
  role: string;
  assigned_assets: AssetSummary[];
}