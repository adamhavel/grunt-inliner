/*
 * grunt-inliner
 * https://github.com/rizzenvrinn/grunt-inliner
 *
 * Copyright (c) 2014 Adam Havel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

   var cheerio = require('cheerio'),
       path = require('path'),
       url = require('url'),
       filesize = require('filesize');

   grunt.registerMultiTask('inliner', 'A no-nonsense style inliner that will take care of all relative paths and won\'t mess up your documents.', function() {

      var options = this.options({
         rebase: true
      });

      this.files.forEach(function(f) {

         var baseDir;
         var src = f.src.filter(function(filepath) {
            if (!grunt.file.exists(filepath)) {
               grunt.log.warn('Source file "' + filepath + '" not found.');
               return false;
            } else {
               return true;
            }
         }).map(function(filepath) {
           baseDir = path.dirname(filepath);
           return grunt.file.read(filepath);
         });

         var $ = cheerio.load(src[0]),
             count = 0,
             size = 0;

         $('link[rel="stylesheet"]').each(function() {
            var regex = /([,\s,:]url\(['"]?(?!data:))([^\)'"]+)(?=['"]?\))/gi,
                href = $(this).attr('href'),
                stylePath = path.resolve(baseDir, href);

            if (url.parse(href).hostname || /^\/\//.test(href)) {
               // TODO: Inline remote stylesheets.
               grunt.log.writeln('"' + href + '" is not a local stylesheet. Skipping.');
               return;
            }

            if (!grunt.file.exists(stylePath)) {
               grunt.log.warn('Stylesheet "' + href + '" not found.');
               return;
            }

            var css = grunt.file.read(stylePath);

            if (options.rebase) {
               css = css.replace(regex, function(whole, front, href) {
                  if (url.parse(href).hostname) {
                     return whole;
                  }
                  return front + path.relative(baseDir, path.resolve(path.dirname(stylePath), href)).replace(/\\/g, '/');
               });
            }

            $(this).replaceWith('<style>' + css + '</style>');

            count++;
            size += css.length;
         });

         if (count) {
            grunt.file.write(f.dest, $.html());
            grunt.log.writeln(count + ' stylesheet' + (count > 1 ? 's' : '') + ' of ' + filesize(size) + ' inlined into "' + f.dest + '".');
         }

      });

   });

};
