# grunt-inliner

> A no-nonsense style inliner that will take care of relative paths and won't mess up your documents.

## Overview

While there are plenty inliners out there, each seems to have its own set of problems. Turning your documents
into XHTML while stripping the doctype, inlining everything including images, or not taking into account that url() in stylesheets can contain data payload or absolute paths. This inliner does none of that — it simply inlines all the referenced stylesheets, including the remote ones if desired, and by default fixes any relative path they may contain.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-inliner --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-inliner');
```

## Inliner

_Run this task with the `grunt inliner` command._

### Options

#### options.rebase
Type: `Boolean`
Default value: `true`

Whether paths found in stylesheet should be rebased relative to a document or not.

#### options.remote
Type: `Boolean`
Default value: `false`

Should remote stylesheets be inlined?

### Usage Examples

```js
grunt.initConfig({
   inliner: {
      options: {
         rebase: false,
         remote: true
      },
      files: [{
         expand: true,
         cwd: 'public',
         src: ['*.html']
      }],
   },
});
```

## Release History

* 2014-08-15   v0.2.0   Added option to inline remote stylesheets.
* 2014-08-14   v0.1.2   Fixed link selector.
* 2014-08-14   v0.1.1   Skip entity decoding.
* 2014-08-14   v0.1.0   Inliner released.

## Release History

MIT © Adam Havel