# ilmt for ssg team by [Chonnaphat Visetchok](https://github.com/Fewsrt)
- we have option to use the code!!
  - Run with Docker
  - Run with Node.js

## Run with Docker
### Build docker image
```
docker build -f Dockerfile -t ilmt-app:`tag_version` .
```
### Run docker image
```
docker run -d -p 8080:80 ilmt-app:`tag_version`
```
After you run already you can access your web from `http://localhost:8080`

## Run with Node.js
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
