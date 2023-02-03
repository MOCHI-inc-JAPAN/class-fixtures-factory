import { FactoryCreator } from '../../src/FactoryCreator';
import { Fixture } from '../../src/decorators/Fixture';
import { Association } from '../../src/decorators/Association';

describe(`nested associations`, () => {
  it('all locates in top level', () => {
    @Association(() => [Author, Biography])
    class Book {
      @Fixture({ type: () => [Author] })
      authors!: Author[];
    }

    class Author {
      @Fixture({ type: () => [Book] })
      books!: Book[];
      @Fixture({ type: () => Biography })
      biography!: Biography;
    }

    class Biography {
      @Fixture('test')
      title!: string;
    }

    class BookFactory extends FactoryCreator(Book, { logging: true }) {}

    const bookFactory = new BookFactory();

    const book = bookFactory.create();

    expect(book.authors[0]).toBeInstanceOf(Author);
    expect(book.authors[0].biography).toBeInstanceOf(Biography);
    expect(book.authors[0].biography.title).toEqual('test');
  });

  it('association chain', () => {
    @Association(() => [Author])
    class Book {
      @Fixture({ type: () => [Author] })
      authors!: Author[];
    }

    @Association(() => [Book, Biography])
    class Author {
      @Fixture({ type: () => [Book] })
      books!: Book[];
      @Fixture({ type: () => Biography })
      biography!: Biography;
    }

    class Biography {
      @Fixture('test')
      title!: string;
    }

    class BookFactory extends FactoryCreator(Book, { logging: true }) {}

    const bookFactory = new BookFactory();

    const book = bookFactory.create();

    expect(book.authors[0]).toBeInstanceOf(Author);
    expect(book.authors[0].biography).toBeInstanceOf(Biography);
    expect(book.authors[0].biography.title).toEqual('test');
  });
});

it(`avoid circular relation many to many`, () => {
  @Association(() => [BookTag])
  class Book {
    @Fixture({ type: () => [BookTag] })
    tags!: BookTag[];
  }

  @Association(() => [Book])
  class BookTag {
    @Fixture({ type: () => [Book] })
    books!: Book[];
  }

  class BookFactory extends FactoryCreator(Book) {}

  class BookTagFactory extends FactoryCreator(BookTag) {}

  const bookFactory = new BookFactory();
  const bookTagFactory = new BookTagFactory();

  const book = bookFactory.create();

  expect(book.tags[0]).toBeInstanceOf(BookTag);
  expect(book.tags[0].books).toBeUndefined();
  const bookTags = bookTagFactory.create();
  expect(bookTags.books[0]).toBeInstanceOf(Book);
  expect(bookTags.books[0].tags).toBeUndefined();
});
