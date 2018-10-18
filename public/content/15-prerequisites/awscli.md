+++
title = "Update to the latest AWS CLI"
chapter = false
weight = 45
+++

1. Run the following command to view the current version of aws-cli:
```
pip freeze | grep awscli
```

1. Update to the latest version:
```
pip install --user --upgrade awscli
```

1. Confirm you have a newer version:
```
pip freeze | grep awscli
```
