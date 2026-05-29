import { SANDBOX_MODE } from '../config';

test('SANDBOX_MODE is a boolean', () => {
  expect(typeof SANDBOX_MODE).toBe('boolean');
});
