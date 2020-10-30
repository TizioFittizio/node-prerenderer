# Node Prerenderer

Node Prerenderer is a web server that render javascript in a browser, save the rendered html and return the result, the rendering is saved in cache

You may want to use this for serving full rendered pages to search engines and crawlers (which most of the cases don't process javascript)

## How to use this

Pull the docker image (you can also build and host your own)

```
docker pull tiziofittizio/node-prerenderer:1.0.0
```

An example on how this can be runned:

```
docker run -d tiziofittizio/node-prerenderer:1.0.0
```

Without a specified port, this will listen on port `7777`, see [Environment variables](#Environment-variables) to modify this

## Environment variables

You can specify the following environment variables when running the container:

Key | Default | Behaviour
--- | --- | ---
CACHE_FILE_PATH | ./cache | This is the path where the cache rendering will be saved, if you want this to be accessible you can mount a docker volume to the same path
PORT | 7777 | Port the server will be listen to
CACHE_RENEW_AFTER_MILLIS | 1000 * 60 * 10 (10 minutes) | Expiry time of a rendering in cache in milliseconds

There are [several ways for specify env variables in docker](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
