import cron from 'node-cron';
import UserSettings from '../models/UserSettings';

class Scheduler{
  
   static async startScheduledTasks() {
   
        cron.schedule('0 0 * * *', async () => {
          try {
            await UserSettings.removeExpiredRecoveryCodes();
          } catch (error) {
            console.error('Error in cron job:', error);
          }
        });
      }

}

export default Scheduler