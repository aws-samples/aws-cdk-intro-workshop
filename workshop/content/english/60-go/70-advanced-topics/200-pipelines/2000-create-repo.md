+++
title = "Create Repository"
weight = 2000
+++

## Create Repo in Pipeline Stack
The first step in any good CD pipeline is source control. Here we will create a [**CodeCommit**](https://aws.amazon.com/codecommit/) repository to contain our project code.

Edit the file `infra/pipeline-stack.go` as follows.

{{<highlight go "hl_lines=5 7 21-23">}}
package infra

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awscodecommit"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type PipelineStackProps struct {
	awscdk.StackProps
}

func NewPipelineStack(scope constructs.Construct, id string, props *PipelineStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	awscodecommit.NewRepository(stack, jsii.String("WorkshopRepo"), &awscodecommit.RepositoryProps{
		RepositoryName: jsii.String("WorkshopRepo"),
	})

	return stack
}
{{</highlight>}}

## Deploy

```
cdk deploy
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

Now all we need to do is to push our code to the repo (`--set-upstream` tells Git to override the current empty main branch on your repo):

```
git push --set-upstream origin main
```

Here, CodeCommit will request the credentials you generated in the **Git Credentials** section. You will only have to provide them once.

### See Result
Now you can return to the CodeCommit console and see that your code is all there!

![](./repo-code.png)

{{< nextprevlinks >}}