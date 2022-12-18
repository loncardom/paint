<h1 align="center">MS Paint Multiplayer</h1>

---

A Windows 98 clone of Microsoft Paint built for the web with support for multiplayer.


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

1. Toolbar:
a) pencil - DONE
b) brush
c) spray
d) line

2. Color bar
a) right click

3. Multiplayer
a) player cursors - DONE
b) remove cursors on inactivity
c) show which tool/colour each player has selected

4. Features
a) add ability to clear board - done
b) allow picture imports
c) allow resizing of canvas
d) implement menu bar

5. Infrastructure
a) change colour data from alphanumeric to HEX