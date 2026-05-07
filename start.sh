#!/bin/bash
cd /home/z/my-project
DATABASE_URL=file:./db/amdrh.db node ./node_modules/.bin/next dev -p 3000 -H 0.0.0.0
