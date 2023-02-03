# @mochi-inc-japan/class-fixtures-factory

This lightweight lib is a class factory to generate fixtures on the fly. However, contrarily to most (or rather all)
libs out there, `class-fixtures-factory` generate fixtures from classes. This is handy when you already have
classes as your source of truth and do not want to write custom schema to generate fixtures.
Also, because the lib is based on emitted TypeScript's metadata, if you heavily
use decorators in your classes (when working with `class-validator`, `type-graphql`, for example), the setup will be even easier.

If you aren't familiar about what fixtures are, they are simply randomly generated data and are often used for database
seeding or for testing.

- [Features](#features)
- [Usage](#usage)
  - [General](#general)
  - [Customization](#customization)
  - [Factory Options](#factory-options)
    - [Assigner](#assigner)
  - [API](#api)

## Features

- Generate fixtures on the fly at runtime
- Leverage `@faker-js/faker.js` for generating random values
- Support relationships between classes
- Customizable

## Usage

### General

Because `class-fixtures-factory` relies on metadata, you'll have to:

1. Register all the classes you're going to use
2. Annotate properties with decorators
   Besides the decorators shipped with the lib, you can also use `class-validator` decorators.

```ts
import { FixtureFactory } from '@mochi-inc-japan/class-fixtures-factory';

const factory = new FixtureFactory();
factory.register([Author, Address, Book]);

// Generate a fixture
let author = factory.make(Author).one();
// Generate multiple fixtures
let authors = factory.make(Author).many(10);

// Ignore some properties at runtime
const partialAuthor = factory
  .make(Author)
  .ignore('address', 'age')
  .one(); // address and age are undefined

// Override properties at runtime
const agedAuthor = factory
  .make(Author)
  .with({
    age: 70,
    address: specialAddr, // any actual address entity object
  })
  .one();
```

### Customization

As stated previously, you'll need to annotate your class properties somehow, because types metadata
are used for generating fixtures.
The lib exposes a `Fixture` decorator for that purpose and for further customization.
If your properties are already annotated with decorators from `class-validator`, there's no need to use `Fixture`, mostly.
However, there are some cases where the `Fixture` decorator is **mandatory**;

- If the type is an array
- If the type is an enum

```ts
class Author {
  // decorator from class-validator
  // no need to use Fixture
  @Length(5, 10)
  name: string;

  @Fixture()
  age: number;

  @Fixture({ type: () => [Book] })
  books: Book[];

  @Fixture({ enum: Mood })
  mood: Mood = Mood.HAPPY;
}
```

Futhermore, `Fixture` can be used for further customization, using [faker.js](https://github.com/marak/Faker.js/#api), as stated:

```ts
export class Author extends BaseEntity {

  @Fixture(faker => faker.name.firstName())
  firstName: string;

  // RESTRICTION: This format doesn't allow `false` boolean and null value, use function style for them.
  @Fixture('FirstName')
  lastName: string;

  @Fixture(() => 24)
  age: number;

  @Fixture({ type: () => [Book] }, { min: 3, max: 5 })
  books: Book[];

  // same as not using @Fixture at all
  @Fixture({ ignore: true })
  address: Address;

  // get function also same function interface
  @Fixture((_, author) => author.books[0].title)
  favoriteBook: string;

  // get function also same function interface
  @Fixture({
    computed: false,
    get: (_, author, metadata) => randomUniqueName()
  })
  favoriteBook: string;
}
```

The second arg is `@Fixture` is fixture it self reference after initialized, so if you want computed dummy data. If you want to stop this feature and only get fix value initialized once, set computed flag false. The third arg is metadata from reflection. It's rare to use, but you can use this when you want to create generator depends on prop name, so on.


### Factory Options

You can pass an `options` object to the `FixtureFactory` constructor:

```ts
import { FixtureFactory } from '@mochi-inc-japan/class-fixtures-factory';

const factory = new FixtureFactory({ /* options */});
```

The `options` parameter can take:
* `debug` (boolean)
  Whether to print generated objects or no.
  ![](debug.png)


* `maxReflectionCallDepth` (number)
  Nested input or object limit count to allow to call deeper association fixture generation.
  The default value is 5. (
    Even if this limit is not set, this library stops direct circular references.
    Indirecly circular referenceds are not detected. Thus this value should set appropriately
    if you have indirect circular references.
  )


#### Assigner

You can provide a function to define how values are assigned to generated objects.
```ts
const assigner: Assigner = (prop, obj, value) => {
  // default behavior
  obj[prop.name] = value;
}
factory.setAssigner(assigner);
```

### API

WIP


### For Babel envrironement

You need setting basically three plugins with Babel.

```js
module.exports = {
  "presets": [
     ...
  ],
  "plugins": [
    ["babel-plugin-transform-typescript-metadata"]
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", {"loose": true}]
  ]
}
```

Some presets already includes some of them, For example, Expo using React Native babel config.

```js
module.exports = {
    "plugins": [
      ["babel-plugin-transform-typescript-metadata"],
    ],
    presets: ['babel-preset-expo'],
}
```

## Thanks to

Oringinal author's repository is https://github.com/CyriacBr/class-fixtures-factory.
