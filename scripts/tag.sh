# /bin/bash

# 确保脚本抛出遇到的错误
set -e

envMode=$1

# 读取 package.json 中的 version
version=`jq -r .version package.json`

# 打包构建

if [ -z "${envMode}" ]; then
  pnpm build
else
  pnpm build -m "${envMode}"
fi

echo BUILD SUCCESS 😁😁😁

# git add .
# git commit -m "feat: update $version"
# git push

# git tag -a $version -m $version
# git push origin $version
# curl -X POST '打包资源上传的服务地址'

echo ⏰ "$(date '+%Y-%m-%d %H:%M:%S')"

if [ -z "${envMode}" ]; then
  pnpm preview
else
  pnpm preview -m "${envMode}"
fi
