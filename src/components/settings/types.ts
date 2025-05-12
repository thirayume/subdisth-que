
export interface LineService {
  sendNotification: (userId: string, message: string) => Promise<void>;
  getLINEProfile: (userId: string) => Promise<any>;
}
