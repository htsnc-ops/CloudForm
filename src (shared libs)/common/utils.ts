// This file contains utility functions used across the application.

export const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseJson = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};