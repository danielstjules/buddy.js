![buddy.js](http://danielstjules.com/buddyjs/logo.png)

Magic number detection for javascript. Let Buddy sniff out the unnamed numerical
constants in your code.

[![Build Status](https://travis-ci.org/danielstjules/buddy.js.png)](https://travis-ci.org/danielstjules/buddy.js)

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

![intro-screenshot](http://danielstjules.com/buddyjs/intro.png)

Who's a good boy?

#### What are magic numbers?

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

## Usage

```
Usage: buddy [options] <paths ...>

Options:

  -h, --help                             output usage information
  -V, --version                          output the version number
  -i, --ignore <numbers>                 list numbers to ignore (default: 0,1)
  -I, --disable-ignore                   disables the ignore list
  -c, --constants                        require literals to be defined using const
  -r, --reporter [simple|detailed|json]  specify the reporter to use (default: simple)
  -C, --no-color                         disables colors
```
