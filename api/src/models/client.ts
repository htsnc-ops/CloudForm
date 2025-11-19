import { Schema, model } from 'mongoose';

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

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  cloudProvider: {
    type: String,
    enum: ['azure', 'aws', 'gcp'],
    required: true,
  },
  credentials: {
    type: {
      type: String,
      enum: ['service-principal', 'iam-role', 'service-account'],
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: false,
    },
    subscriptionId: {
      type: String,
      required: false,
    },
  },
  containerEndpoint: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Client = model('Client', clientSchema);

export default Client;