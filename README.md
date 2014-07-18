![buddy.js](http://danielstjules.com/buddyjs/logo.png)

Magic number detection for javascript. Let Buddy sniff out the unnamed constants
in your code.

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
