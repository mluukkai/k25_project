#!/bin/bash

pg_dump $DB_URL > dump.sql

timestamp=$(date +%Y-%m-%d-%H-%M)
mv dump.sql dump-$timestamp.sql

node index.js dump-$timestamp.sql

while true; do
  echo "Sleeping for 5 seconds..."
  sleep 5000
done
