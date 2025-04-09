
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SettingsData {
  [key: string]: any;
}

export const useSettings = (category: string) => {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('category', category);

      if (error) {
        throw error;
      }

      // Convert array of {key, value} objects to a single object
      const settingsObject: SettingsData = {};
      if (data) {
        data.forEach(item => {
          settingsObject[item.key] = item.value;
        });
      }

      setSettings(settingsObject);
      console.log(`Fetched ${data?.length || 0} settings for category ${category}`);
      
      // Save to localStorage as a fallback for offline access
      localStorage.setItem(`settings_${category}`, JSON.stringify(settingsObject));
    } catch (err: any) {
      console.error(`Error fetching settings for ${category}:`, err);
      setError(err.message || `Failed to fetch ${category} settings`);
      
      // Try to load from localStorage if network request fails
      const savedSettings = localStorage.getItem(`settings_${category}`);
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
          toast.info('ใช้ข้อมูลการตั้งค่าที่บันทึกไว้ในเครื่อง');
        } catch (parseErr) {
          console.error('Error parsing saved settings:', parseErr);
        }
      } else {
        toast.error(`ไม่สามารถโหลดข้อมูลการตั้งค่า ${category} ได้`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      // First update local state for immediate UI update
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Save to localStorage as backup
      localStorage.setItem(`settings_${category}`, JSON.stringify({
        ...settings,
        [key]: value
      }));

      // Then save to Supabase
      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            category,
            key,
            value
          },
          { onConflict: 'category,key' }
        );

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      console.error(`Error updating setting ${key}:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่า ${key} ได้`);
      return false;
    }
  };

  const updateMultipleSettings = async (newSettings: SettingsData) => {
    try {
      // First update local state for immediate UI update
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
      
      // Save to localStorage as backup
      localStorage.setItem(`settings_${category}`, JSON.stringify({
        ...settings,
        ...newSettings
      }));

      // Prepare data for Supabase
      const upsertData = Object.entries(newSettings).map(([key, value]) => ({
        category,
        key,
        value
      }));

      // Then save to Supabase
      const { error } = await supabase
        .from('settings')
        .upsert(upsertData, { onConflict: 'category,key' });

      if (error) {
        throw error;
      }

      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error(`Error updating multiple settings:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้`);
      return false;
    }
  };

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchSettings();
    
    // Set up real-time subscription for settings changes
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings', filter: `category=eq.${category}` },
          (payload) => {
            console.log('Settings data change detected:', payload);
            fetchSettings(); // Refresh all settings when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateMultipleSettings
  };
};
