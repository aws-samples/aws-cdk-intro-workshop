+++
title = "Create Repository"
weight = 120
+++

## Create Repo in Pipeline Stack
The first step in any good CD pipeline is source control. Here we will create a [**CodeCommit**](https://aws.amazon.com/codecommit/) repository to contain our project code.

Edit the file `cdk_workshop/pipeline_stack.py` as follows.

{{<highlight python "hl_lines=4 12-16">}}
from constructs import Construct
from aws_cdk import (
    core,
    aws_codecommit as codecommit,
)

class WorkshopPipelineStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Creates a CodeCommit repository called 'WorkshopRepo'
        repo = codecommit.Repository(
            self, 'WorkshopRepo',
            repository_name= "WorkshopRepo"
        )

        # Pipeline code goes here
{{</highlight>}}

## Deploy
Now we can install the missing package and deploy the app to see our new repo.

```
pip install aws-cdk.aws_codecommit
npx cdk deploy
```

## Get Repo Info and Commit
Before we can do anything with our repo, we must add our code to it!

### Git Credentials
Before we can do that, we will need Git credentials for the repo. To do this, go to the [IAM Console](https://console.aws.amazon.com/iam), then navigate to `Users` and then your user of choice.
Inside the manage user interface, navigate to the `Security credentials` tab and scroll until you see "HTTPS Git credentials for AWS CodeCommit". Click generate credentials and follow the instructions on downloading those credentials. We will need them in a moment.

![](./git-cred.png)

### Add Git remote
The last console step we will need here is to navigate to the [CodeCommit Console](https://console.aws.amazon.com/codesuite/codecommit/repositories) and look for your repo. You will see a column called "Clone URL"; click "HTTPS" to copy the https link so we can add it to your local repo.

> Note: If you do not see your repo here, ensure you are in the interface for the correct region

![](./clone-repo.png)

> While you are here, feel free to explore your repo. You will see that it is still empty, but you do have access to the repo configuration information.

In your terminal, first make sure that all the changes you have made during the workshop are committed by issuing `git status`. If you have unstaged or uncommitted changes, you can execute `git commit -am "SOME_COMMIT_MESSAGE_HERE"`. This will stage and commit all your files so you are ready to go!

> Note: If you copied the code from the repo rather than following through the workshop from the beginning, first issue `git init && git add -A && git commit -m "init"`

Next, we add the remote repo to our Git config. You can do this with the command (*XXXXX* represents the Clone URL you copied from the console):

```
git remote add origin XXXXX
```

Now all we need to do is to push our code to the repo (`--set-upstream` tells Git to override the current empty master branch on your repo):

```
git push --set-upstream origin master
```

Here, CodeCommit will request the credentials you generated in the **Git Credentials** section. You will only have to provide them once.

### See Result
Now you can return to the CodeCommit console and see that your code is all there!

![](./repo-code.png)
