export interface Client {
  id: string;
  name: string;
  cloudProvider: 'azure' | 'aws' | 'gcp';
  authType: string;
  status: 'ready' | 'creating' | 'error';
  createdAt?: string;
  containerEndpoint?: string;
}

export interface Credentials {
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  subscriptionId?: string;
  accessKey?: string;
  secretKey?: string;
  projectId?: string;
}
