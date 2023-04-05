const { exec } = require('child_process');
const command = 'bash ./backup.sh';

const makeBackup = () => {
  const dbPassword = 'vkdima03';
  const dbHost = 'localhost';
  const dbUser = 'postgres';
  const dbPort = 5432;
  const dbName = 'test_pm';

  const format = 'dump';
  const now = new Date();
  const currentDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  const backupFilePath = `../../backups/backup-${currentDate}.${format}`;

  exec(`${command} ${dbPassword} ${dbHost} ${dbUser} ${dbPort} ${dbName} ${backupFilePath}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while execute ${command}: ${error}`);
        return ;
      };
      if (stderr) {
        return console.error(`Stderr while execute ${command}: ${stderr}`);
      };
      console.log(`Backup of ${dbName} at ${now.toLocaleString()} was successfully created: ${stdout}`);
    });
};

export { makeBackup };
