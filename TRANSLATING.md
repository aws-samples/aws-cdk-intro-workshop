# Adding translations to the AWS CDK Worshop

In order to create a new localization of the AWS CDK Workshop:

* Update `config.toml` to include a new language
* Create the appropriate i18n file. In `i18n`, create `my-ln.yaml` based on
  the `en.yaml` file
* Copy the English content into a new directory and begin localizing.



Don't be afraid to translate comments in code! The reason for this level of
customization is to make sure that code is readable in all languages, not
just the original English. 

# i18n files

The YAML files within the i18n directory define a handful of language-specific
tweaks to that language. In particular:

* Font to use for the main body/headings/code, as well as a Google Fonts URL
  that is used to import any non-system fonts that might be used.
* Strings used to define the missing-translated-content flag. 

The *Roboto* font is included by default. The English localization uses the
PT Mono typeface for code samples, falling back to Monospace (as defined by
the browser), whereas the Japanese localization uses a specific Gothic Coder
typeface with a latin fallback.
