const path = require('path');
const programDir = path.join(__dirname, '..', 'programs', 'lock');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'lock',
  programId: '4vqVPmSjNpfPhHpJi9FgMBnabKgK5oFyNJwgFnKtN4yp',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};
