# altpackage

- global packages per project. if project A requires 'ionic' 4.3 and your project B requires ionic 4.5,
these will conflict. at least, yarn nor npm, will not be aware of the project needing ionic. altpackage 
will have an adatpor to direct the execution to the projects ionic package. this feature would be great 
if the package could be a symlink.

attempts with yarn:
'yarn link' needs to be executed in a packge on the filesystem. perhaps linking in the yarn cache will work
but that sounds crazy. or is it? 'yarn global add' will add a symlink, such as ionic, to the OS Env.Path, and a user
can do a subsequent 'yarn global add' with a different ionic version, but only the original will be used.
yarn's resolutions is use a common dependency version among others, which is different.

https://github.com/yarnpkg/yarn/issues/5535
https://github.com/yarnpkg/yarn/issues/6374
https://github.com/leveneg/yarn-global-install-bug/blob/master/package.json

- adaptor to map commands for your needs. this was created since a dependency in my 
project called npm. i typically use yarn, so I map the command to yarn.
if customized is needed, then Copy-Item from altpackage/lib/adaptor/npm_adaptor.ts to local project. then
have that path in listed in the config file. TypeScript complier will also need to know about this file.
