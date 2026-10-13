import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import App from '../src/App.vue'
import router from '../src/router'

describe('debug', () => {
  it('routes', () => {
    const all = router.getRoutes()
    console.log('total routes:', all.length)
    console.log('paths:', all.map((r) => r.path).join(', '))
    expect(all.length).toBeGreaterThan(0)
  })
})
