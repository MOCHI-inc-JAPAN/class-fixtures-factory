import { FixtureFactory } from '../../src/FixtureFactory';
import { Fixture } from '../../src/decorators/Fixture';
import { reflect } from '@plumier/reflect';

describe(`Circular Refs`, () => {
  const factory = new FixtureFactory({ logging: false });

  describe(`factory result`, () => {
    it(`class prevent circular ref one to one`, () => {
      class Book {
        @Fixture()
        title!: string;
        @Fixture({ type: () => Person })
        author!: Person;
      }

      class Person {
        @Fixture({ type: () => Book })
        book!: Book;
        @Fixture()
        name!: string;
      }

      factory.register([Person, Book]);

      const person = factory.make(Person).one();
      expect(person.book).toBeInstanceOf(Book);
      expect(person.book.author).toBeUndefined();
      expect(person.book.title).not.toBeUndefined();

      const book = factory.make(Book).one();
      expect(book.author).toBeInstanceOf(Person);
      expect(book.author).toBeUndefined();
    });

    it(`avoid circular relation many to many`, () => {
      class Book {
        @Fixture({ type: () => [BookTag] })
        tags!: BookTag[];
      }
      class BookTag {
        @Fixture({ type: () => [Book] })
        books!: Book[];
      }
      factory.register([BookTag, Book]);

      const book = factory.make(Book).one();
      expect(book.tags[0]).toBeInstanceOf(BookTag);
      expect(book.tags[0].books).toBeUndefined();
      const bookTags = factory.make(BookTag).one();
      expect(bookTags.books[0]).toBeInstanceOf(Book);
      expect(bookTags.books[0].tags).toBeUndefined();
    });

    it(`avoid circular relation one to many`, () => {
      // NOTE: One to many relationship depends on order, many relationship
      // must be defined as first. Or define manuarly value.
      let factory = new FixtureFactory({ maxReflectionCallDepth: 5 });

      class Person {
        @Fixture({ type: () => [Book] })
        book!: Book[];
        @Fixture()
        name!: string;
      }

      class Book {
        @Fixture()
        title!: string;
        @Fixture({ type: () => Person })
        author!: Person;
      }

      factory.register([Person, Book]);

      let author = factory.make(Person).one();
      let book = factory.make(Book).one();

      expect(author).toBeTruthy();
      expect(book).toBeTruthy();
    });
  });
});
