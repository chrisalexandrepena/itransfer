import del from 'del';
import fs from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { watch, series } from 'gulp';

function rmlib(cb) {
  const libPath = join(__dirname, 'lib');
  if (fs.existsSync(libPath)) del.sync(libPath);
  else console.log('no lib folder to delete');
  cb();
}

function build(cb) {
  execSync('tsc');
  cb();
}

exports.rmlib = rmlib;
exports.watch = () => watch(join(__dirname, '**/*'), {}, series([rmlib, build]));
exports.default = series([rmlib, build]);
