
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import PharmacyQueueHeader from '@/components/pharmacy-queue/PharmacyQueueHeader';
import PharmacyQueueEmptyState from '@/components/pharmacy-queue/PharmacyQueueEmptyState';
import PharmacyQueueContent from '@/components/pharmacy-queue/PharmacyQueueContent';
import PharmacyQueueLoading from '@/components/pharmacy-queue/PharmacyQueueLoading';
import { MedicationsProvider } from '@/components/medications/context/MedicationsContext';

const PharmacyQueue = () => {
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints,
    loading: loadingServicePoints
  } = useServicePointContext();

  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      setSelectedServicePoint(servicePoint);
    }
  };

  if (loadingServicePoints) {
    return (
      <Layout>
        <PharmacyQueueLoading />
      </Layout>
    );
  }

  return (
    <Layout className="overflow-hidden">
      <MedicationsProvider>
        <div className="flex flex-col h-[calc(100vh-2rem)]">
          <PharmacyQueueHeader
            selectedServicePoint={selectedServicePoint}
            servicePoints={servicePoints}
            onServicePointChange={handleServicePointChange}
          />

          {!selectedServicePoint ? (
            <PharmacyQueueEmptyState />
          ) : (
            <PharmacyQueueContent
              selectedServicePoint={selectedServicePoint}
              refreshTrigger={Date.now()}
            />
          )}
        </div>
      </MedicationsProvider>
    </Layout>
  );
};

export default PharmacyQueue;
