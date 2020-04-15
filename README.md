# ITransfer Backend :rocket:

This library to allow you to share files from a server with the outside world by generating download links.

Enjoy ! :heart:

# `Table of contents`

- [Setup](#setup)
- [API reference](#api\ reference)
- [Known issues](#known\ issues)

# `Setup`
First clone the repository
```
git clone git@github.com:chrisalexandrepena/itransfer-backend.git
```
create a new **postgresql** database then use the provided **.env.dist** file to create your own environment file 
- **APP_PORT**: The port your app is going to be running on (defaults to 8080)
- **ENV**: dev or prod (defaults to dev)
- **HOST**: host url to prepend to your generated links
- **SHARED_DIR**: (optionnal) if you want to be able to generate links using a path relative to a specific directory instead of always using absolute paths
- **POSTGRES_PORT**: port to access your database
- **POSTGRES_HOST**: host of you database
- **POSTGRES_USER**: user to access your database
- **POSTGRES_PASSWORD**: password to access your database
- **POSTGRES_DB**: name of your database

you need to install **typescript** and **gulp** (optionnal) globally:
```sh
npm i -g typescript gulp
```
you can now install the project dependencies:
```sh
npm i
```
you can now build the app:
```sh
gulp
```
if you don't want to use gulp you may juste build your app using:
```sh
npm run build
#or
tsc
```
run the migrations:
```sh
npm run typeorm migration:run
```
your app is ready, start it using:
```
npm start
```
or however you prefer!

# `API reference`
## GET CALLS
### `/download/:hash`
downloads the file linked to the given *hash*
### `/links`
returns all available links
## POST CALLS
### `/link/generate`
generates a single download link, if multiple paths are submited they will be compressed in a single zip file.
body params:
- filePaths: *string[]*
- expirationDate: *(optional) ISOstring*
### `/links/generate`
generates individual links for each submitted paths.
body params:
- filePaths: *string[]*
- expirationDate: *(optional) ISOstring*
## DELETE CALLS
### `/link/delete/:hash`
deletes a link
### `/links/delete?hashes[]=...&hashes[]=...`
deletes multiple links

# `Known issues`
The app expects the database to be able to generate uuid fields, sometimes the required addon isn't installed or activated. The package you need is called **postgresql-11-postgis-3** (your version of postgresql and postgis may vary), check that it is installed.
You can then activate it using
```sh
psql -d -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
```