Deploys test harness to the same directory as where altpackage resides.

in package.json, the scripts has a 'install-altpackage' command to execute deploy.js which will have node to do the moving.

also there is the 'add-altpackages' which to be called by the developer when altpackage.config.json needs to be digested and reflected.

altpack-harness is a CLI test harness to test that packages are resolved as expected.
