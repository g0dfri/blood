# blood

A cron job for fetching blood.org.tw to gh-pages.

# Usage

export GH_TOKEN & GH_REF to your environment variables

```shell
export GH_TOKEN=<GH_TOKEN>
export GH_REF=github.com/g0v/blood.git
```

Install dependencies:

```shell
npm install
```

and execute `main.js` to fetch data blood.org.tw, convert to json and send to gh-pages.

```shell
node main.js
```

# License

MIT License
