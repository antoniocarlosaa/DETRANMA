
export interface DebtItem {
  description: string;
  category: 'IPVA' | 'Licenciamento' | 'Multa' | 'Taxa' | 'Outros';
  value: number;
  dueDate?: string;
}

export interface VehicleConsultation {
  plate: string;
  renavam: string;
  ownerName?: string;
  vehicleModel?: string;
  totalDebts: number;
  items: DebtItem[];
  consultedAt: string;
}

export interface VehicleHistoryItem {
  plate: string;
  renavam: string;
  vehicleModel?: string;
  lastConsulted: string;
}

export interface GeminiParsingResult {
  success: boolean;
  data?: {
    ownerName: string;
    vehicleModel: string;
    items: DebtItem[];
  };
  error?: string;
}
