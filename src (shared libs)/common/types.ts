export type Client = {
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
};

export type CommandOutput = {
  type: 'command' | 'output' | 'system' | 'info';
  text: string;
};

export type NewClientData = {
  clientName: string;
  cloudProvider: 'azure' | 'aws' | 'gcp';
  authType: 'service-principal' | 'iam-role' | 'service-account';
  clientId: string;
  clientSecret: string;
  tenantId: string;
  subscriptionId: string;
};