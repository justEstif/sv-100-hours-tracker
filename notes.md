Assess these problems:

- Deploying this app to dokku fails because:
    1. dokku doesn't have a built-in bun support
        - maybe we can use the bun dockerfile from the docs: https://bun.com/docs/guides/ecosystem/docker
    2. dokku doesn't have built-in libsql support
        - since dokku have great support for postgres, maybe we can move to that
    3. i've been using mise.toml for env management, does dokku use mise? or do we have to switch
       to using .env
