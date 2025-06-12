import Mock from 'mockjs'
import { resultSuccess, doCustomTimes } from '../util'

const Random = Mock.Random
const tableList = (pageSize: number) => {
  const result: any[] = []
  doCustomTimes(pageSize, () => {
    result.push({
      id: '@integer(10,999)',
      name: '@cname()',
      age: '@integer(10,50)',
      job: '@pick(["Player", "Developer", "Designer", "Tester", "Manager", "Actor"])',
      sex: '@pick(["boy", "girl"])',
      city: '@city()',
      date: `@date('yyyy-MM-dd')`,
      time: `@time('HH:mm')`,
      created: '@datetime'
    })
  })
  return result
}

export default [
  //表格数据列表
  {
    url: '/api/table/list',
    timeout: 1000,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query
      const list = tableList(pageSize)
      //并非真实，只是为了模拟搜索结果
      return resultSuccess({
        total: 100,
        page,
        pageSize,
        list
      })
    }
  }
]
