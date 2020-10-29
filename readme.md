# Node Prerenderer

The Node Prerenderer is a web server that render javascript in a browser, save the rendered html and return the result, the rendering is saved in cache

You may want to use this for serving full rendered pages to search engines and crawlers (which most of the cases don't process javascript)

# How to use this

Pull the docker image (you can also build and host your own)

```
docker pull tiziofittizio/node-prerenderer:1.0.0
```

You should specify the following environment variables when running the container:

* CACHE_FILE_PATH

  This is the path where the cache rendering will be saved, if you want this to be accessible you can mount a docker volume to the same path

* PORT

  Port the server will be listen to 

* CACHE_RENEW_AFTER_MILLIS

  Expiry time of a rendering in cache in milliseconds
  Default: 10 minutes

An example on how this can be runned:

```
docker run -e CACHE_FILE_PATH="./cache" tiziofittizio/node-prerenderer:1.0.0
```

There are [several ways for specify env variables in docker](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)

# TODO add endpoint explanation ecc
