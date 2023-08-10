#!/bin/bash

docker run -p 8080:8080 -e "DOCKER_VERNEMQ_ACCEPT_EULA=yes" -e "DOCKER_VERNEMQ_ALLOW_ANONYMOUS=on" -d vernemq/vernemq
