/*
 * grunt-inliner
 * https://github.com/adamhavel/grunt-inliner
 *
 * Copyright (c) 2014 Adam Havel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

   var cheerio = require('cheerio'),
       path = require('path'),
       url = require('url'),
       filesize = require('filesize'),
       XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

   grunt.registerMultiTask('inliner', 'A no-nonsense style inliner that will take care of relative paths and won\'t mess up your documents.', function() {

      var options = this.options({
         rebase: true,
         remote: false
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

         var $ = cheerio.load(src[0], { decodeEntities: false }),
             count = 0,
             size = 0;

         function injectStyle(link, css) {
            link.replaceWith('<style>' + css + '</style>');
            count++;
            size += css.length;
         }

         $(':not(noscript) > link[rel="stylesheet"]').each(function() {
            var regex = /([,\s,:]url\(['"]?(?!data:))([^\)'"]+)(?=['"]?\))/gi,
                href = $(this).attr('href'),
                stylePath = path.resolve(baseDir, href);

            if (url.parse(href).hostname || /^\/\//.test(href)) {

               if (options.remote) {
                  var xhr = new XMLHttpRequest();
                  xhr.open('GET', href, false);
                  xhr.send(null);

                  if (xhr.readyState === 4) {
                     injectStyle($(this), xhr.responseText);
                  }
               } else {
                  grunt.log.warn('Remote stylesheet "' + href + '" found. Skipping.');
                  return;
               }

            } else if (href) {

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

               injectStyle($(this), css);

            }

         });

         if (count) {
            grunt.file.write(f.dest, $.html());
            grunt.log.writeln(count + ' stylesheet' + (count > 1 ? 's' : '') + ' of size ' + filesize(size) + ' inlined into "' + f.dest + '".');
         }

      });

   });

};
