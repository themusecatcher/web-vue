# /bin/bash

# 确保脚本抛出遇到的错误
set -e

# 读取 package.json 中的 version
version=`jq -r .version package.json`

# 打包构建
pnpm build

echo BUILD SUCCESS 😁😁😁

git add .
git commit -m "update $version"
git push

# git tag -a $version -m $version
# git push origin $version
# curl -X POST 'http://ci.jinhui365.cn/view/web/job/web_app_vue/build?token=abcde'
