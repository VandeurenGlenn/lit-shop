import { opendir, open } from 'fs/promises'
import { exec, execSync } from 'child_process'
import { join } from 'path'

const packagesDir = './packages'

const packages = await opendir(packagesDir)
console.log(packages)

let promises = []

const getPackageInfo = async (path) => {
  try {
    const fd = await open(`${path}/package.json`)
    const packageInfo = await fd.read()
    await fd.close()
    packageInfo.packagePath = path
    console.log(packageInfo)
    return packageInfo
  } catch (error) {
    return undefined
  }
}

for await (const dirent of packages) {
  promises.push(getPackageInfo(join(dirent.parentPath, dirent.name)))
}

const packageInfos = await Promise.all(promises)

const runCommand = (command, options) => {
  try {
    const result = execSync(command, options)

    return result.toString()
  } catch (error) {
    console.error(error)
  }
}

promises = []
for (const packageInfo of packageInfos) {
  if (packageInfo) {
    promises.push(runCommand(`cd ${packageInfo.packagePath} && ncu -u --install=always`, { shell: true }))
  }
}
console.log(await Promise.all(promises))
