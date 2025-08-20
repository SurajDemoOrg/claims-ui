import { SampleDataDemo } from '../components/SampleDataDemo';
import { logger } from '../utils/logger';

export function SampleDataDemoPage() {
  logger.componentMount('SampleDataDemoPage');
  
  return <SampleDataDemo />;
}
