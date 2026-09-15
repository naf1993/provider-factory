import {
  TalabatAdapter,
} from './talabat.adapter.js';

describe(
  'TalabatAdapter',
  () => {
    let adapter:
      TalabatAdapter;

    beforeEach(
      () => {
        adapter =
          new TalabatAdapter();
      },
    );

    it(
      'throws for semantic provider menu error',
      () => {
        const rawDocument = {
          url:
            'https://www.talabat.com/uae/restaurant/12345/test?aid=10',

          payload: {
            Message:
              'This is not restaurant page (Talabat).',
          },
        };

        expect(
          () =>
            adapter
              .transformMenuDocument(
                rawDocument,
              ),
        ).toThrow();
      },
    );
  },
);