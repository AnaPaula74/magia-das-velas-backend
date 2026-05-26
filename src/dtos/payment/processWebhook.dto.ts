export interface ProcessWebhookDTO {
  action?: string;
  api_version?: string;
  data?: {
    id?: string | number;
  };
  date_created?: string;
  id?: number;
  live_mode?: boolean;
  type?: string;
  user_id?: number;
}