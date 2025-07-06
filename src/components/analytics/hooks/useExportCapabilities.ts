import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { simulationLogger } from '@/utils/simulationLogger';

const logger = createLogger('ExportCapabilities');

export interface ExportData {
  queues: any[];
  algorithmMetrics: any[];
  simulationLog: any[];
  summary: {
    totalQueues: number;
    completedQueues: number;
    avgWaitTime: number;
    avgServiceTime: number;
    algorithmsUsed: string[];
    sessionDuration: string;
  };
}

export const useExportCapabilities = () => {
  
  // Generate comprehensive CSV export
  const generateCSVExport = useCallback(async (): Promise<string> => {
    try {
      logger.info('📊 Generating CSV export...');
      
      // Fetch all simulation queues
      const { data: queues, error } = await supabase
        .from('queues')
        .select(`
          *,
          patients!inner(name, phone, patient_id),
          service_points(name, code)
        `)
        .like('notes', '%ข้อมูลจำลองโรงพยาบาล%')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching queues for CSV:', error);
        throw error;
      }

      if (!queues || queues.length === 0) {
        throw new Error('No simulation data found for export');
      }

      // Generate CSV headers
      const headers = [
        'Queue ID',
        'Patient Name',
        'Patient Phone',
        'Patient ID',
        'Queue Type',
        'Queue Number',
        'Status',
        'Service Point',
        'Created At',
        'Called At',
        'Completed At',
        'Wait Time (Minutes)',
        'Service Time (Minutes)',
        'Notes'
      ];

      // Generate CSV rows
      const rows = queues.map(queue => {
        const waitTime = queue.called_at && queue.created_at
          ? Math.round((new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime()) / 60000)
          : 0;
        
        const serviceTime = queue.completed_at && queue.called_at
          ? Math.round((new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime()) / 60000)
          : 0;

        return [
          queue.id,
          queue.patients?.name || 'N/A',
          queue.patients?.phone || 'N/A',
          queue.patients?.patient_id || 'N/A',
          queue.type,
          queue.number,
          queue.status,
          queue.service_points?.name || 'N/A',
          queue.created_at,
          queue.called_at || 'N/A',
          queue.completed_at || 'N/A',
          waitTime,
          serviceTime,
          queue.notes || 'N/A'
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      logger.info('✅ CSV export generated successfully');
      return csvContent;

    } catch (error) {
      logger.error('Error generating CSV export:', error);
      throw error;
    }
  }, []);

  // Generate algorithm comparison CSV
  const generateAlgorithmComparisonCSV = useCallback(async (algorithmMetrics: any[]): Promise<string> => {
    try {
      logger.info('📊 Generating algorithm comparison CSV...');
      
      if (!algorithmMetrics || algorithmMetrics.length === 0) {
        throw new Error('No algorithm metrics found for export');
      }

      const headers = [
        'Phase',
        'Algorithm',
        'Average Wait Time (Minutes)',
        'Throughput (Completed Queues)',
        'Total Completed Queues',
        'Processed in Phase',
        'Timestamp'
      ];

      const rows = algorithmMetrics.map(metric => [
        metric.phase,
        metric.algorithm,
        metric.avgWaitTime,
        metric.throughput,
        metric.completedQueues,
        metric.processedInPhase,
        metric.timestamp
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      logger.info('✅ Algorithm comparison CSV generated successfully');
      return csvContent;

    } catch (error) {
      logger.error('Error generating algorithm comparison CSV:', error);
      throw error;
    }
  }, []);

  // Download CSV file
  const downloadCSV = useCallback((csvContent: string, filename: string) => {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      logger.info(`✅ CSV file downloaded: ${filename}`);
      simulationLogger.log('CSV_DOWNLOADED', 'EXPORT', 'EXPORT', `Downloaded CSV file: ${filename}`);
    } catch (error) {
      logger.error('Error downloading CSV:', error);
      throw error;
    }
  }, []);

  // Generate chart image (using canvas)
  const generateChartImage = useCallback((chartId: string, filename: string) => {
    try {
      logger.info(`📊 Generating chart image for: ${chartId}`);
      
      // Find the chart element
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error(`Chart element not found: ${chartId}`);
      }

      // Create canvas from chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      // Set canvas size based on chart element
      const rect = chartElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          logger.info(`✅ Chart image downloaded: ${filename}`);
          simulationLogger.log('CHART_IMAGE_DOWNLOADED', 'EXPORT', 'EXPORT', `Downloaded chart image: ${filename}`);
        }
      }, 'image/png');

    } catch (error) {
      logger.error('Error generating chart image:', error);
      throw error;
    }
  }, []);

  // Export complete simulation package
  const exportSimulationPackage = useCallback(async (algorithmMetrics: any[]) => {
    try {
      logger.info('📦 Starting complete simulation package export...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // 1. Export queue data CSV
      const queueCSV = await generateCSVExport();
      downloadCSV(queueCSV, `simulation_queues_${timestamp}.csv`);
      
      // 2. Export algorithm comparison CSV
      if (algorithmMetrics && algorithmMetrics.length > 0) {
        const algorithmCSV = await generateAlgorithmComparisonCSV(algorithmMetrics);
        downloadCSV(algorithmCSV, `algorithm_comparison_${timestamp}.csv`);
      }
      
      // 3. Export simulation log JSON
      simulationLogger.downloadReport();
      
      // 4. Generate chart images (if available)
      setTimeout(() => {
        try {
          generateChartImage('wait-time-chart', `wait_time_chart_${timestamp}.png`);
          generateChartImage('throughput-chart', `throughput_chart_${timestamp}.png`);
        } catch (error) {
          logger.warn('Some chart images could not be generated:', error);
        }
      }, 1000);
      
      logger.info('✅ Complete simulation package export completed');
      simulationLogger.log('PACKAGE_EXPORT_COMPLETED', 'EXPORT', 'EXPORT', `Complete simulation package exported at ${timestamp}`);
      
    } catch (error) {
      logger.error('Error exporting simulation package:', error);
      throw error;
    }
  }, [generateCSVExport, generateAlgorithmComparisonCSV, downloadCSV, generateChartImage]);

  // Quick export functions
  const exportQueuesCSV = useCallback(async () => {
    try {
      const csvContent = await generateCSVExport();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadCSV(csvContent, `simulation_queues_${timestamp}.csv`);
    } catch (error) {
      logger.error('Error exporting queues CSV:', error);
      throw error;
    }
  }, [generateCSVExport, downloadCSV]);

  const exportAlgorithmMetricsCSV = useCallback(async (algorithmMetrics: any[]) => {
    try {
      const csvContent = await generateAlgorithmComparisonCSV(algorithmMetrics);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadCSV(csvContent, `algorithm_metrics_${timestamp}.csv`);
    } catch (error) {
      logger.error('Error exporting algorithm metrics CSV:', error);
      throw error;
    }
  }, [generateAlgorithmComparisonCSV, downloadCSV]);

  return {
    exportSimulationPackage,
    exportQueuesCSV,
    exportAlgorithmMetricsCSV,
    generateChartImage,
    downloadCSV,
    generateCSVExport,
    generateAlgorithmComparisonCSV
  };
};