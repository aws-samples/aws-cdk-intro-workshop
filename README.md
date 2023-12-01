## Introduction to the AWS Cloud Development Kit (CDK) - Workshop

## Developer Guide

This workshop is built with markdown as a static HTML site using [hugo](http://gohugo.io).

### Installing Hugo

Because we use asset pipelines and some integrity stamping techniques, we need the "extended" edition.
(This is the recommended version by Hugo themselves, but it's worth pointing out.)

On MacOS, you can install it straight from Brew:

```bash
$ brew install hugo
```

There are [installation instructions](https://gohugo.io/installation/) available from the Hugo documentation,
however the short form is "Download the latest extended version from [the releases page](https://github.com/gohugoio/hugo/releases/latest) and put the
binary in your PATH somewhere".

All else fails, follow the installation instructions. As long as you have the Extended hugo release, it's all good. 

### Theme

This is built off the [Hugo-Book](https://github.com/alex-shpak/hugo-book) theme, lightly modified to suit our needs.
A point of note is that this *Should* eventually be moved to a git submodule, but there's changes that need to be upstreamed.

Notably:

* Upstream does not use any [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) checking. This is done out of paranoia
* Upstream still has a small handful of inline styles (which I've worked hard to remove)

### Building locally

You'll find the content of the workshop in the [workshop/](workshop/) directory.

You can start up a local development server by running:

```bash
$ cd workshop
$ hugo serve 
```

open http://localhost:1313/ and you'll have the workshop as it stands.

### Adding translations & localization.

Adding a translation means

* Copying the content from `workshop/content/en/` into your own directory (`workshop/content/xx`)
* Translating the content
* Adding a configuration for your language in `workshop/config.toml`
* Adding a translation file for all appropriate legal terms in the `workshop/i18n/xx.yml` file, copied from `en.yml`
  
**The last part is important**! We need to have a translation for

* "Privacy", "Site Terms"

And we *Should* have a translation for

* The cookie banner message
* the cookie banner *actions*. 

These will fall back to the English ones (such as in the JP one) and the link will go to the appropriate-enough regional terms and privacy pages.

**If your language needs special fonts** in order to render correctly, you should add them in the localization file.
For example, the Japanese localization uses Noto Sans JP to
make sure that the typography looks good, as well as using
two fixed-width typefaces (Nanum Gothic Coding and M PLUS Rounded 1c)
in order to make the mixed English-Japanese legible for everyone. 

```yaml
- id: fontUrl
  translation: "https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=M+PLUS+Rounded+1c:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
- id: bodyFontFamily
  translation: "'Noto Sans JP', sans-serif"
- id: headingFontFamily
  translation: "'Noto Sans JP', sans-serif"
- id: codeFontFamily
  translation: "'Nanum Gothic Coding' 'M PLUS Rounded 1c', monospace"
```


There *must* be some backup font included -- The stylesheet will not
provide one for you. As a rule of thumb, Noto makes a good option for
most languages, with `sans-serif` falling back on whatever the browser
can provide most efficiently. Code fonts should be monospace.

If you can, you want at least the following weights:

* 400 (used for body text)
* 500 (used for for headlines)
* 700 (used for bold text)

Do *not* use "artsy" typefaces. According to AWS style guides, we
should be using Ember, but the typeface isn't cleared for hosting on
GitHub. Until then, we'll use Noto Sans as a default where reasonable.

*The use of serifed headlines is allowed* if the language expects it.
Chinese is monotonous to read when only presented in "sans". To give
a clean distinction between headline and body, CJK languages or any
language which "prefers" a certain type of headline may opt to use
a "serif" (read: alternate style) headline typeface. 

When in doubt, ask a native speaker and look to examples of type in
that language (technical books, newspapers, etc are good starts) to
find guidance in what historically separates headline text from the
body text. AWS customers (and employees!) come from all around the
world, and this is intended to cater to them.

## Website Infrastructure

The workshop is available at https://cdkworkshop.com. It's a static website hosted on S3 and served through CloudFront.

It is implemented as a (_surprise_) CDK application under the `cdkworkshop.com`
directory.

* `npm install` - bootstrap.
* `npm run build` and `npm run watch`
* `npm run deploy` - build & deploy

### Auto-deployment

You shouldn't have to manually deploy: Any commit merged into `main` should cause the site to self-deploy via CodeBuild.

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.
