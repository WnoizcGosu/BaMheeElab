#!/bin/bash

curl -X POST http://localhost:3000/api/submissions \
    -H "Content-Type: application/json" \
    -d '{
    "problemId": "prob-001",
    "language": "PYTHON",
    "sourceCode": "print(\"Hello\")"
    }' | jq .
