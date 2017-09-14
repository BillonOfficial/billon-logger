import {
    childLogger,
} from '../src';

/**
 * Dummy test
 */
describe('Dummy test', () => {

    it('works if true is truthy', () => {
        const log = childLogger(__filename);

        log.debug(`test`, test);
    });

    it('DummyClass is instantiable', () => {
        // expect(new DummyClass()).toBeInstanceOf(DummyClass);
    });
});
