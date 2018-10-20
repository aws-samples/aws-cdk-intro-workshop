#!/bin/bash
set -e
cd workshop
hugo
cd public
aws s3 sync . s3://cdk-workshop-prod-bucket83908e77-1stfho26ffrv7/

