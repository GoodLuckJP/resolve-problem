export interface Email {
  id: number;
  title: string;
  email: string;
  bcrypt_id: string;
}

export interface EmailDetail {
  id: number;
  title: string;
  email: string;
  cc: string | null;
  template_type: string;
  plan?: string;
  confirmation?: string;
  goal?: string;
  known_info?: string;
  question?: string;
}

export interface EmailTemplateData {
  title: string;
  email: string;
  cc?: string;
  template_type: string;
  plan?: string;
  confirmation?: string;
  goal?: string;
  known_info?: string;
  question?: string;
}
