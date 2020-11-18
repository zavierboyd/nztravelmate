# Developing NZ Travel Mate

We use TypeScript and NodeJS to create this app.
For testing we use the Mocha testing framework.
You will need to run `npm install --only=dev` to get all the proper type files.
You will also need to run `npm install --global typescript` or `npm install --save-dev typescript` if you do not yet have typescript installed.

## Guidelines

Any function that references global variables need to be in index.ts
Any stand alone function is to be put in utilities.ts

All function and variables need to be Typed unless TypeScript can infer the correct type.
All functions in utilities.ts need to be sorted into the correct group and have test cases to make sure their behaviors work.

All functions should be self descriptive, but if there is some part of a function that does not make sense add a comment to explain it.

## API

The current API endpoint is: https://open.exchangerate-api.com/v6/latest.
Go to https://www.exchangerate-api.com to get to the documentation.

If the endpoint returns a non-zero time_eol_unix then the endpoint needs to be updated before that time. 

## Testing

For testing we have access to the Mocha and Chai libraries

All testing functions live in testing.ts.
Each grouping of functions have their own `describe(<Grouping>, function() {...})`
Each function in a group has their own `describe(<function>, function() {...})`
For each test case use `it('should <what it should do>, function() {<test case>})`
or `it('should <what it should do>, async function() {<test case>})` if you want to use async/await.

In the end this should look something like this: 
```
describe('Group', function () {
  describe('function', function () {
    it('should not equal 1', function () {
      assert.notEqual(someFunction(), 1)
    })
  })
})
```

To use the SaveData object do `const yourVariable = deepCopySimple(baseData)`.
This data is not correct so for any values you want to use, define them.

To run open testing.html in your browser.


If a function relies on internet connectivity, use an if statement before your asserts to test for it so that they don't fail when the internet is not in the correct state.
Use this if statement to test for internet connectivity `if (window.navigator.onLine) { ...`
This will not actually test for internet connectivity but network connectivity. This is a good enough indicator though.


## Updating Packages
### Bulma 
```
rm bulma.min.css font-awesome-all.js && wget --output-document='bulma.min.css' https://cdn.jsdelivr.net/npm/bulma/css/bulma.min.css
```

### Font Awesome
You will need to find the latest font awesome script for html. Should look something like this:
`https://use.fontawesome.com/releases/v5.14.0/js/all.js`

```
rm font-awesome-all.js && wget --output-document='font-awesome-all.js' <url for font awesome all.js>
```

### Mocha && Chai
```
rm mocha.js chai.js && wget --output-document='mocha.js' https://unpkg.com/mocha/mocha.js && wget --output-document='mocha.css' https://unpkg.com/mocha/mocha.css && wget --output-document='chai.js' https://unpkg.com/chai/chai.js
```

# Creating a New Release

1. Make sure that bulma and font awesome are up to date.
1. Make sure all tests pass
1. Create a new branch called release `git checkout -b release`
1. `git rm -rf *.ts *.json testing.* DevelopersREADME.md mocha.* chai.* .gitignore`
1. `rm -rf node_modules .vscode`
1. `git add -A && git commit -m "commit message here"`
1. `git push`
1. Message the main maintainer to have a look at the release