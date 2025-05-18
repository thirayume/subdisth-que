
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SettingsData } from '@/integrations/supabase/database.types';

export interface SettingsState {
  [key: string]: any;
}

export const useSettings = (category: string = 'general') => {
  const [settings, setSettings] = useState<SettingsState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any to work around type system limitations
      const { data, error } = await (supabase as any)
        .from('settings')
        .select('key, value')
        .eq('category', category);

      if (error) {
        throw error;
      }

      // Convert array of {key, value} objects to a single object
      const settingsObject: SettingsState = {};
      if (data) {
        data.forEach((item: SettingsData) => {
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

  const updateSettings = async (data: any, category: string = 'general') => {
    try {
      // If data is a key-value pair
      if (typeof data === 'object' && 'key' in data && 'value' in data) {
        const { key, value } = data;
        
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
        const { error } = await (supabase as any)
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
      } 
      // If data is an array of updates
      else if (Array.isArray(data)) {
        // Update local state
        const updatedSettings = { ...settings };
        for (const item of data) {
          if (item.key) {
            updatedSettings[item.key] = item.value;
          }
        }
        setSettings(updatedSettings);
        
        // Save to localStorage
        localStorage.setItem(`settings_${category}`, JSON.stringify(updatedSettings));
        
        // Save to Supabase
        const { error } = await (supabase as any)
          .from('settings')
          .upsert(
            data.map((item: any) => ({
              ...item,
              category: item.category || category
            })),
            { onConflict: 'category,key' }
          );

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (err: any) {
      console.error(`Error updating setting:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้`);
      return false;
    }
  };

  const updateMultipleSettings = async (newSettings: SettingsState, category: string = 'general') => {
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

      // Then save to Supabase using any to bypass type checking
      const { error } = await (supabase as any)
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
    const channel = (supabase as any)
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings', filter: `category=eq.${category}` },
          (payload: any) => {
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
