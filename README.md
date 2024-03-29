<h1 align="center">MS Paint Multiplayer</h1>

<p align="center">
   <img width="803" height="587" src="https://raw.githubusercontent.com/loncardom/paint/main/paint.png"/>
</p>


A clone of Microsoft Paint for Windows 98 built for the web with support for multiplayer.


## Docker Deployment
The image is not yet public so you will have to build it yourself with `docker build . -t $USERNAME/$IMAGE_NAME`
```
  paint:
    image: $USERNAME/$IMAGE_NAME
    container_name: paint
    ports:
      - 5501:5501
    restart: always
```
You can then access the application on your server IP:5501. I have tested SSL with Traefik using labels and can confirm they work as expected.

## Running the Server
The application can also be run on bare metal with the following commands:
1. `node server.js`
2. `cd frontend/`
3. `npm run build`
4. go to localhost:3000

## Development
For development, you can build the application with the following:
1. `node server.js`
2. `cd frontend/`
3. `npm start`
4. go to localhost:3000

## TODO

#### Toolbar:
1. pencil ✅
2. brush
3. spray
4. line

#### Color bar
1. right click

#### Multiplayer
1. player cursors ✅
2. remove cursors on inactivity
3. show which tool/colour each player has selected

#### Features
1. add ability to clear board ✅
2. allow picture imports
3. allow resizing of canvas
4. implement menu bar

#### Infrastructure
1. change colour data from alphanumeric to HEX
