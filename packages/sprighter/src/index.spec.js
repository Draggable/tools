import sprighter from './index'
import { makeSvgSprite } from './index'

describe('colors/index.js', () => {
  it('should present colors', () => {
    expect(sprighter).toMatchSnapshot()
  })
})
