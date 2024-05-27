#!/bin/bash

AWS_PROFILE="nuvilab"
PROJECT_NAME="kitchen-manager"

if [ -z "$1" ]; then
  echo "스택 템플릿 파일 경로를 입력하세요."
  exit 1
fi


TEMPLATE_FILE_PATH="$1"
FILE_NAME=$(basename "$TEMPLATE_FILE_PATH")

STACK_NAME="$PROJECT_NAME-${FILE_NAME%.*}"
echo TEMPLATE_FILE_PATH: $TEMPLATE_FILE_PATH
echo STACK_NAME: $STACK_NAME

aws cloudformation deploy \
  --profile "$AWS_PROFILE" \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE_PATH" \
  --region "ap-northeast-2"
