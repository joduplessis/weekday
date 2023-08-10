import { shallow } from 'enzyme'
import React from 'react'
import '../../../../enzyme.setup'

describe('Testing framework setup', () => {
  it('renders', () => {
    const wrapper = shallow(<h1>Welcome to Weekday</h1>)
    expect(wrapper.find('h1').html()).toMatch(/Welcome to Weekday/)
  })
})

describe('Async page loading', () => {
  beforeAll(async () => {
    await page.goto('https://google.com')
  })

  it('should be titled "Google"', async () => {
    await expect(page.title()).resolves.toMatch('Google')
  })
})

function sum(a, b) {
  return a + b
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
