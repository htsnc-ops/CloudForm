// src/types/index.d.ts

export interface Client {
  id: string;
  name: string;
  cloudProvider: 'azure' | 'aws' | 'gcp';
  credentials: {
    type: 'service-principal' | 'iam-role' | 'service-account';
    clientId: string;
    clientSecret: string;
    tenantId?: string;
    subscriptionId?: string;
  };
  containerEndpoint: string;
  createdAt: string;
}

export interface TerminalOutput {
  type: 'command' | 'output' | 'system' | 'info';
  text: string;
}

export interface NewClientData {
  clientName: string;
  cloudProvider: 'azure' | 'aws' | 'gcp';
  authType: 'service-principal' | 'iam-role' | 'service-account';
  clientId: string;
  clientSecret: string;
  tenantId: string;
  subscriptionId: string;
}