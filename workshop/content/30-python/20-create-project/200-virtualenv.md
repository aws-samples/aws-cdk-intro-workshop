+++
title = "Activating the virtualenv"
weight = 200
+++

## Activating the Virtualenv

The init script we ran in the last step created a bunch of code to help get us
started, but it also created a virtual environment within our directory.  If you
haven't used virtualenv before, you can find out more
[here](https://docs.python.org/3/tutorial/venv.html) but the bottom line is
that they allow you have a self-contained, isolated environment to run Python
and install arbitrary packages without polluting your system Python.

To take advantage of the virtual environment that was created, you have to
activate it within your shell.  The generated README file provides all of this
information, but we are calling it out here because it is important.  To
activate your virtualenv on a Linux or MacOs platform:

```
source .env/bin/activate
```

One a Windows platform, you would use this:

```
.env\Scripts\activate.bat
```

Now that the virtual environment is activated, you can safely install the
required python modules.

```
pip install -r requirements.txt
```
