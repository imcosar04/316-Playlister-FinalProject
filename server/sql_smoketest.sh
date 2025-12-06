#!/usr/bin/env bash
set -euo pipefail

echo "Register..."
curl -s -c cookies.txt -H "Content-Type: application/json" \
  -d '{"firstName":"Ana","lastName":"Kim","email":"ana@example.com","password":"hunter2xx","passwordVerify":"hunter2xx"}' \
  http://localhost:4000/auth/register | jq .

echo "Logged in..."
curl -s -b cookies.txt http://localhost:4000/auth/loggedIn | jq .

echo "Create playlist..."
CREATE=$(curl -s -b cookies.txt -H "Content-Type: application/json" \
  -d '{"name":"My Mix","ownerEmail":"ana@example.com","songs":[{"title":"Song A","artist":"X","year":2022,"youTubeId":"abc"}]}' \
  http://localhost:4000/store/playlist)
echo "$CREATE" | jq .
ID=$(echo "$CREATE" | jq -r '.playlist.id // .playlist._id')

echo "Pairs..."
curl -s -b cookies.txt http://localhost:4000/store/playlistpairs | jq .

echo "Get by id..."
curl -s -b cookies.txt http://localhost:4000/store/playlist/$ID | jq .

echo "Update..."
curl -s -b cookies.txt -X PUT -H "Content-Type: application/json" \
  -d '{"playlist":{"name":"My Mix v2","songs":[{"title":"Song B","artist":"Y","year":2023,"youTubeId":"def"}]}}' \
  http://localhost:4000/store/playlist/$ID | jq .

echo "Delete..."
curl -s -b cookies.txt -X DELETE http://localhost:4000/store/playlist/$ID | jq .
