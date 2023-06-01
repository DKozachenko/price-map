import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';

/**
 * Сервис для бэкапов БД
 * @export
 * @class BackupService
 */
@Injectable()
export class BackupService {
  /**
   * Создание бэкап
   * @memberof BackupService
   */
  public makeBackup(): void {
    const dbPassword: string = 'vkdima03';
    const dbHost: string = 'localhost';
    const dbUser: string = 'postgres';
    const dbPort: number = 5432;
    const dbName: string = 'real_data_pm';
    const command: string = 'bash ./apps/backend/backup.sh';
  
    const format: string = 'dump';
    const now: Date = new Date();
    const currentDate: string = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}` 
      + `-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    const backupFilePath: string = `./apps/backend/backups/backup-${currentDate}.${format}`;
  
    exec(`${command} ${dbPassword} ${dbHost} ${dbUser} ${dbPort} ${dbName} ${backupFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          Logger.error(`Error while execute ${command}: ${error}`, 'makeBackup');
          return ;
        };
        if (stderr) {
          Logger.error(`Stderr while execute ${command}: ${stderr}`, 'makeBackup');
          return;
        };
        Logger.debug(`Backup of ${dbName} at ${now.toLocaleString()}` 
          + ` was successfully created: ${stdout}`, 'makeBackup');
      });
  };
}
