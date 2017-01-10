![buddy.js](http://danielstjules.com/github/buddyjs-logo.png)

Magic number detection for javascript. Let Buddy sniff out the unnamed numerical
constants in your code.

[![Build Status](https://travis-ci.org/danielstjules/buddy.js.svg?branch=master)](https://travis-ci.org/danielstjules/buddy.js)

* [Overview](#overview)
  * [What are magic numbers?](#what-are-magic-numbers)
* [Installation](#installation)
* [Usage](#usage)
* [Integration](#integration)
* [Reporters](#reporters)
* [Ignoring numbers](#ignoring-numbers)

## Overview

We all know magic numbers are frowned upon as a programming practice. They may
give no indication of their meaning, and when used multiple times, can result
in future inconsistencies. They can expose you to the risk of typos, hinder
maintenance and have an impact on readability. That's where Buddy comes in.

Buddy is a cli tool that's eager to find the magic numbers in your code. It
accepts a list of paths to parse, and renders any found instances with the
selected reporter. In the case of directories, they're walked recursively,
and only `.js` files are analyzed. Any `node_modules` dirs are also ignored.

Since `const` is not widespread in JavaScript, it defaults to searching for
numbers which are not the sole literal in an object expression or variable
declaration. Furthermore, specific values can be ignored, such as 0 and 1,
which are ignored by default.

![intro-screenshot](http://danielstjules.com/github/buddyjs-intro.png)

Who's a good boy?

### What are magic numbers?

Magic numbers are unnamed numerical constants, though the term can sometimes
be used to refer to other literals as well. Take the following contrived
example:

``` javascript
function getTotal(subtotal) {
  var beforeTax = subtotal + 9.99;
  return beforeTax + (beforeTax * 0.13);
}
```

In the above function, the meaning of the two numbers might not be clear.
What is this 9.99 charge? In our case, let's say it's a shipping rate. And
what about the 0.13? It's the sales tax. Buddy will highlight those
two instances:

```
$ buddy example.js

example.js:2 | var beforeTax = subtotal + 9.99;
example.js:3 | return beforeTax + (beforeTax * 0.13);

 2 magic numbers found across 1 file
 ```

If the tax rate was used in multiple locations, it's prone to human error.
And it might not be immediately clear that the 9.99 charge is a flat rate
shipping cost, which can affect maintenance. So how would this be improved?

``` javascript
var FLAT_SHIPPING_COST = 9.99;
var SALES_TAX = 0.13;

function getTotal(subtotal) {
  var beforeTax = subtotal + FLAT_SHIPPING_COST;
  return beforeTax + (beforeTax * SALES_TAX);
}
```

Or, depending on your target platforms or browsers, by using the `const`
keyword for variable declaration instead of `var`. While `const` is
available in Node, you should take note of its
[browser compatibility](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const#Browser_compatibility)
for front end JavaScript.

```
$ buddy example.js

 No magic numbers found across 1 file
```

## Installation

It can be installed via `npm` using:

```
npm install -g buddy.js
```

Also available: [grunt-buddyjs](https://github.com/eugene-bulkin/grunt-buddyjs),
and [gulp-buddy.js](https://github.com/Semigradsky/gulp-buddy.js)

## Usage

```
Usage: buddy [options] <paths ...>

Options:

  -h, --help                             output usage information
  -V, --version                          output the version number
  -d, --detect-objects                   detect object expressions and properties
  -e, --enforce-const                    require literals to be defined using const
  -i, --ignore <numbers>                 list numbers to ignore (default: 0,1)
  -I, --disable-ignore                   disables the ignore list
  -r, --reporter [simple|detailed|json]  specify reporter to use (default: simple)
  -C, --no-color                         disables colors
```

If a `.buddyrc` file is located in the project directory, its values will be
used in place of the defaults listed above. For example:

``` javascript
{
  "detectObjects": false,
  "enforceConst":  false,
  "ignore":        [0, 1, 2], // Use empty array to disable ignore
  "reporter":      "detailed"
}
```

## Integration

You can easily run Buddy on your library source as part of your build. It will
exit with an error code of 0 when no magic numbers were found. Otherwise it
will return a positive error code, and result in a failing build. For example,
with Travis CI, you can add the following two entries to your `.travis.yml`:

```
before_script:
  - "npm install -g buddy.js"

script:
  - "buddy ./path/to/src"
```

## Reporters

For additional context, try using the detailed reporter. Or, for logging output
and integration with your quality assurance process, the json reporter can
be used.

![detailed-reporter](http://danielstjules.com/github/buddyjs-detailed.png)

## Ignoring numbers

A magic number can be ignored in any of three ways:

 1. Its value is ignored using the `--ignore` flag
 2. The line includes the following comment `buddy ignore:line`
 3. The line is located between a `buddy ignore:start` and `buddy ignore:end`

Given the following example, two magic numbers exist that could be ignored:

``` javascript
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
```

Using the command line option, you can run buddy with:
`buddy example.js --ignore 60`. Or, if preferred, you can specify that the
instances be ignored on a case-by-case basis:

``` javascript
var SECOND = 1000;
var MINUTE = 60 * SECOND; // buddy ignore:line
var HOUR = 60 * MINUTE; // buddy ignore:line
```

Or better yet, you can make use of directives to ignore all magic numbers
within a range:

``` javascript
// buddy ignore:start
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
// buddy ignore:end
```
