import { Property } from './Property';

export interface Entity {
  name: string;
  properties: Property[];
  filePath?: string;
  isExisting?: boolean;
  baseSkip?: boolean;
}