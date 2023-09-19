+++
title = "Test the hit counter"
weight = 700
+++

## Issue a few test requests

Let's issue a few requests and see if our hit counter works. You can also use
your web browser to do that:

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/hello/world
```

## Open DynamoDB console

1. Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodb/home).
2. Make sure you are in the region where you created the table.
3. Select `Tables` in the navigation pane and select the table that starts with `cdkworkshop-HelloHitCounterHits`.
4. Open the table and select "Items".
5. You should see how many hits you got for each path.

    ![](./dynamo1.png)

6. Try hitting a new path and refresh the Items view.
   You should see a new item with a `hits` count of one.

## Good job!

The cool thing about our `HitCounter` is that it's quite useful. It basically
allows anyone to "attach" it to any Lambda function that serves as an API
Gateway proxy backend and it will log hits to this API.

Since our hit counter is a simple Python class, you could package it and then publish to [PyPI](http://pypi.org/), the default Package Index for the Python community. Then, anyone could `pip install` it and add it to
their CDK apps.

-----

In the next chapter we __consume__ a construct library published to
pip, which enables us to view the contents of our hit counter table from any
browser.
