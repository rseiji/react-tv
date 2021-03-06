const path = require('path');
const chalk = require('chalk');
const execSync = require('child_process').execSync;

function defaultCLIEnv() {
  // if darwin
  return '/opt/webOS_TV_SDK/CLI/bin';
}

module.exports = function runWebOS(paramsPath) {
  let webOS_TV_SDK_ENV = process.env['WEBOS_CLI_TV'] || false;
  if (!webOS_TV_SDK_ENV) webOS_TV_SDK_ENV = defaultCLIEnv();

  process.env['PATH'] = `${webOS_TV_SDK_ENV}:${process.env['PATH']}`;

  console.log('');
  console.log(chalk.dim('Up Emulator...'));
  execSync(
    `open ${webOS_TV_SDK_ENV}/../../Emulator/v3.0.0/LG_webOS_TV_Emulator_RCU.app`
  );
  console.log(chalk.yellow(' LG WebOS Emulator 3.0.0 succefull running'));

  let attemps = 0;
  let task = setInterval(function _runWebOSDevTask() {
    let runningVMS = execSync(`vboxmanage list runningvms`).toString();
    if (attemps > 15) {
      console.log('FAILED TO UP virtualbox emulator');
      clearInterval(task);
    }

    if (runningVMS.indexOf('webOS') < 0) {
      attemps += 1;
      return false;
    }

    clearInterval(task);

    console.log(runningVMS);
    const webOSAPPPath = path.resolve(paramsPath, 'webos');
    console.log(chalk.dim('Packing...'));

    execSync(`cd ${webOSAPPPath} && ares-package .`);
    console.log(chalk.yellow(` succefull pack from ${webOSAPPPath}`));

    console.log(chalk.dim('Installing...'));
    const config = JSON.parse(
      execSync(`cat ${webOSAPPPath}/appinfo.json`).toString()
    );

    const latestIPK = config.id + '_' + config.version + '_all.ipk';
    console.log(chalk.blue(` installing ${latestIPK} as IPK`));
    execSync(`cd ${webOSAPPPath} && ares-install ${latestIPK}`);
    console.log(chalk.yellow(` succefull install ${config.title}`));

    console.log(chalk.dim('Launching...'));
    execSync(`cd ${webOSAPPPath} && ares-launch ${config.id}`);
    console.log(chalk.yellow(` launched`));
  }, 500);
};
