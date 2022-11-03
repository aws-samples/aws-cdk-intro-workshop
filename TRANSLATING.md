# Adding translations to the AWS CDK Worshop

Thank you for your interest in translating the CDK workshop!

To add a translation (here for the fictitious 'MyLang' language)

* Copy the English content into a new directory and begin localizing.
  
  ```
  mv content/english content/mylang
  ```

* Update `config.toml` to include a new language

  ```toml
    [languages.ml]
      languageName="MyLang"
      contentDir="content/mylang"
  ```

* Create the appropriate i18n file. In `i18n`, create `ml.yaml` based on
  the `en.yaml` file



Don't be afraid to translate comments in code! The reason for this level of
customization is to make sure that code is readable in all languages, not
just the original English. 

# i18n files

The YAML files within the i18n directory define a handful of language-specific
tweaks to that language. In particular:

* Font to use for the main body/headings/code, as well as a Google Fonts URL
  that is used to import any non-system fonts that might be used.

The *Roboto* font is included by default. The English localization uses the
PT Mono typeface for code samples, falling back to Monospace (as defined by
the browser), whereas the Japanese localization uses a specific Gothic Coder
typeface with a latin fallback.
