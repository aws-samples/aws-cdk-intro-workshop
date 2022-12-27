+++
title = "Private Construct Hub"
weight = 200
bookCollapseSection = true
+++

# Private Construct Hub

As demonstrated in previous modules, creating your own CDK constructs is easy and intuitive. But how do you go about sharing these constructs with other members of your organziation? There is the Construct Hub (https://constructs.dev/) but this is a public-facing website i.e. anyone in the world can access it. Perhaps your constructs are for internal Intellectual Property (IP) or as part of research and development initiatives. It's likely against company policy to expose this type of information.

Lucky for you, the Construct Hub itself is a CDK Construct! This means you can deploy this in an AWS account and only allow access to internal resources. This way you can share your constructs with members of your team or organization without exposing them to the outside world.

![](./300-private-construct-hub/private-construct-hub.png)

To enable this functionality, you'll deploy the architecture shown in the above diagram.

There are typically 3 types of users who will leverage the private construct hub in some way:
1. Construct Hub Consumers - Developers who will navigate to the Private Construct Hub looking for helpful CDK constructs
2. Construct Hub Producers - Developers who publish constructs to the Private Construct Hub
3. Construct Hub Administrators - These individuals are responsible for managing the overall pipeline that deploys constructs to the Private Construct Hub

The upcoming steps in this module are mapped to the needs of these types of users. In the next lab, you'll start by deploying the front-end for the Private Construct Hub (The box labeled "Private ConstructHub").


