// Preserve Jest's exit status/default output; make failed tests readable in check annotations.
const {relative} = require('node:path');
const escape = value => String(value).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
module.exports = class CiTestReporter {
  onTestResult(_test, result) {
    const failures = result.testResults.filter(test => test.status === 'failed')
      .map(test => test.fullName+'\n'+test.failureMessages.join('\n'));
    if (result.testExecError) failures.push(result.failureMessage || result.testExecError.stack || result.testExecError.message);
    const file = relative(process.cwd(), result.testFilePath).replaceAll('\\','/');
    for (const failure of failures) console.log(`::error file=${file},title=Unit test failure::${escape(failure)}`);
  }
};
